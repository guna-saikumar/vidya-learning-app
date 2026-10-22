import { Inject, Injectable } from "@nestjs/common";
import {
  getClassSummaries,
  getCurriculumStats,
} from "../../../../../packages/curriculum/src/curriculum.service";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  AdminDashboardResponse,
  StudentDashboardResponse,
  UsersOverview,
} from "./dashboard.types";

@Injectable()
export class DashboardService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private curriculumOverview() {
    const stats = getCurriculumStats();
    const classes = getClassSummaries();
    return {
      totalClasses: stats.totalClasses,
      totalSubjects: stats.totalSubjects,
      totalChapters: stats.totalChapters,
      totalSections: stats.totalSections,
      classes,
    };
  }

  private async usersOverview(): Promise<UsersOverview> {
    const [byRole, verifiedStudents, unverifiedStudents, deptGroups, total] =
      await Promise.all([
        this.prisma.user.groupBy({
          by: ["role"],
          _count: { _all: true },
        }),
        this.prisma.user.count({
          where: { role: "STUDENT", emailVerifiedAt: { not: null } },
        }),
        this.prisma.user.count({
          where: { role: "STUDENT", emailVerifiedAt: null },
        }),
        this.prisma.user.groupBy({
          by: ["department"],
          where: {
            role: { in: ["ADMIN", "SUPER_ADMIN"] },
            department: { not: null },
          },
          _count: { _all: true },
        }),
        this.prisma.user.count(),
      ]);

    const roleCount = (role: "STUDENT" | "ADMIN" | "SUPER_ADMIN") =>
      byRole.find((row) => row.role === role)?._count._all ?? 0;

    return {
      total,
      students: roleCount("STUDENT"),
      admins: roleCount("ADMIN"),
      superAdmins: roleCount("SUPER_ADMIN"),
      verifiedStudents,
      unverifiedStudents,
      byDepartment: deptGroups
        .filter((row) => row.department)
        .map((row) => ({
          department: row.department as string,
          count: row._count._all,
        }))
        .sort((a, b) => b.count - a.count),
    };
  }

  async getAdminDashboard(recentLimit = 8): Promise<AdminDashboardResponse> {
    const limit = Math.min(Math.max(recentLimit, 1), 50);
    const [curriculum, users, recent] = await Promise.all([
      Promise.resolve(this.curriculumOverview()),
      this.usersOverview(),
      this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      curriculum,
      users,
      materials: {
        persisted: false,
        total: 0,
        published: 0,
        drafts: 0,
        archived: 0,
      },
      recentUsers: recent.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }

  async listUsers(options: {
    role?: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);
    const where = options.role ? { role: options.role } : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      total,
      limit,
      offset,
      items: items.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        emailVerified: Boolean(u.emailVerifiedAt),
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }

  async getStudentDashboard(userId: string): Promise<StudentDashboardResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    return {
      generatedAt: new Date().toISOString(),
      user: {
        id: user?.id ?? userId,
        name: user?.name ?? "Student",
        email: user?.email ?? "",
        role: user?.role ?? "STUDENT",
      },
      curriculum: this.curriculumOverview(),
    };
  }
}
