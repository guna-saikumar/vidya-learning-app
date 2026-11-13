import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAvatarUrl, normalizeProfile, toApiProfilePatch } from '../src/services/profileMapper';

describe('Profile Avatar Resolution & Normalization', () => {
  it('returns empty string when url is null, undefined, or empty', () => {
    assert.equal(resolveAvatarUrl(null), '');
    assert.equal(resolveAvatarUrl(undefined), '');
    assert.equal(resolveAvatarUrl(''), '');
    assert.equal(resolveAvatarUrl('   '), '');
  });

  it('keeps absolute http(s) URLs intact', () => {
    const url = 'https://example.com/photos/avatar.png';
    assert.equal(resolveAvatarUrl(url), url);
  });

  it('keeps local file, blob, and data URIs intact for optimistic rendering', () => {
    const fileUri = 'file:///var/mobile/Containers/Data/Application/avatar.jpg';
    const blobUri = 'blob:http://localhost:8081/abc-123';
    const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...';

    assert.equal(resolveAvatarUrl(fileUri), fileUri);
    assert.equal(resolveAvatarUrl(blobUri), blobUri);
    assert.equal(resolveAvatarUrl(dataUri), dataUri);
  });

  it('resolves relative /uploads paths using API base URL', () => {
    const relativePath = '/uploads/avatars/student_1.jpg?v=1792668900000';
    const resolved = resolveAvatarUrl(relativePath);
    assert.match(resolved, /^https?:\/\/.+\/uploads\/avatars\/student_1\.jpg\?v=1792668900000$/);
  });

  it('normalizes backend profile DTO with resolved avatar URL', () => {
    const apiProfile = {
      name: 'Ravi Kumar',
      activeClassId: 'class-9',
      avatarUrl: '/uploads/avatars/ravi.jpg?v=123',
    };

    const normalized = normalizeProfile(apiProfile);
    assert.match(normalized.avatarUrl, /^https?:\/\/.+\/uploads\/avatars\/ravi\.jpg\?v=123$/);
    assert.equal(normalized.displayName, 'Ravi Kumar');
  });

  it('strips avatarUrl from toApiProfilePatch so PATCH /profile does not wipe it', () => {
    const patch = toApiProfilePatch({
      activeClassId: 'class-10',
      avatarUrl: 'file:///local/temp.jpg',
    });

    assert.equal(patch.classId, 'class-10');
    assert.equal('avatarUrl' in patch, false);
  });
});
