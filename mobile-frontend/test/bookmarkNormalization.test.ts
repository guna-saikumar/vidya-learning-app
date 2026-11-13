import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeBookmark } from '../src/services/profileMapper';

const chapterBookmark = {
  id: 'c123',
  classId: 'class-6',
  subjectId: 'c6-maths',
  chapterId: 'c6-m-ch1',
  sectionId: null,
  title: 'Numbers Notes',
  subtitle: 'Class 6 • Mathematics',
  type: 'chapter',
  previewText: 'An introduction to numbers.',
  dateAdded: '2026-01-02T03:04:05.000Z',
};

describe('bookmark normalization', () => {
  it('maps a complete chapter DTO', () => {
    const bookmark = normalizeBookmark(chapterBookmark);

    assert.equal(bookmark.id, 'c123');
    assert.equal(bookmark.classId, 'class-6');
    assert.equal(bookmark.subjectId, 'c6-maths');
    assert.equal(bookmark.chapterId, 'c6-m-ch1');
    assert.equal(bookmark.sectionId, undefined);
    assert.equal(bookmark.type, 'chapter');
    assert.equal(bookmark.title, 'Numbers Notes');
    assert.equal(bookmark.subtitle, 'Class 6 • Mathematics');
    assert.equal(bookmark.previewText, 'An introduction to numbers.');
    assert.equal(bookmark.dateAdded, Date.parse('2026-01-02T03:04:05.000Z'));
  });

  it('keeps a section bookmark as a section', () => {
    const bookmark = normalizeBookmark({
      ...chapterBookmark,
      type: 'section',
      sectionId: 'c6-m-ch1-s1',
    });

    assert.equal(bookmark.type, 'section');
    assert.equal(bookmark.sectionId, 'c6-m-ch1-s1');
  });

  it('keeps formula bookmarks instead of converting them', () => {
    const bookmark = normalizeBookmark({
      ...chapterBookmark,
      type: 'formula',
    });

    assert.equal(bookmark.type, 'formula');
  });

  it('never invents an id when the server omits it', () => {
    assert.throws(
      () => normalizeBookmark({ ...chapterBookmark, id: undefined }),
      /missing id/
    );
  });

  it('requires the navigation target fields', () => {
    assert.throws(
      () => normalizeBookmark({ ...chapterBookmark, classId: '' }),
      /missing classId/
    );
    assert.throws(
      () => normalizeBookmark({ ...chapterBookmark, subjectId: undefined }),
      /missing subjectId/
    );
    assert.throws(
      () => normalizeBookmark({ ...chapterBookmark, chapterId: undefined }),
      /missing chapterId/
    );
  });

  it('rejects unknown bookmark types', () => {
    assert.throws(
      () => normalizeBookmark({ ...chapterBookmark, type: 'video' }),
      /Unsupported bookmark type/
    );
  });

  it('rejects a section bookmark without a sectionId', () => {
    assert.throws(
      () => normalizeBookmark({ ...chapterBookmark, type: 'section' }),
      /missing sectionId/
    );
  });
});
