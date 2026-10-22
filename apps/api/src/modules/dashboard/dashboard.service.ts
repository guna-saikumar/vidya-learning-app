import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  AdminDashboardResponse,
  CurriculumOverview,
  MaterialsOverview,
  StudentDashboardResponse,
  UsersOverview,
} from "./dashboard.types";

@Injectable()
export class DashboardService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async curriculumOverview(): Promise<CurriculumOverview> {
    const rows = await this.prisma.schoolClass.findMany({
      orderBy: [{ grade: "asc" }, { id: "asc" }],
      include: {
        subjects: {
          select: {
            chapters: {
              select: { _count: { select: { sections: true } } },
            },
          },
        },
      },
    });

    const classes = rows.map((c) => {
      let chapterCount = 0;
      let sectionCount = 0;
      for (const subject of c.subjects) {
        chapterCount += subject.chapters.length;
        for (const chapter of subject.chapters) {
          sectionCount += chapter._count.sections;
        }
      }
      return {
        id: c.id,
        grade: c.grade,
        title: c.title,
        subtitle: c.subtitle,
        badge: c.badge,
        subjectCount: c.subjects.length,
        chapterCount,
        sectionCount,
      };
    });

    return {
      totalClasses: classes.length,
      totalSubjects: classes.reduce((n, c) => n + c.subjectCount, 0),
      totalChapters: classes.reduce((n, c) => n + c.chapterCount, 0),
      totalSections: classes.reduce((n, c) => n + c.sectionCount, 0),
      classes,
    };
  }

  private async materialsOverview(): Promise<MaterialsOverview> {
    const groups = await this.prisma.material.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const count = (status: "draft" | "published" | "archived") =>
      groups.find((g) => g.status === status)?._count._all ?? 0;
    const published = count("published");
    const drafts = count("draft");
    const archived = count("archived");
    return {
      persisted: true,
      total: published + drafts + archived,
      published,
      drafts,
      archived,
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
    const [curriculum, users, materials, recent] = await Promise.all([
      this.curriculumOverview(),
      this.usersOverview(),
      this.materialsOverview(),
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
      materials,
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
      curriculum: await this.curriculumOverview(),
    };
  }
}
