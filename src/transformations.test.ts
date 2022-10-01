import {describe, expect, test} from '@jest/globals';
import {transformEditorData} from './transformations';

describe('transformations', () => {
  test('transform from grid editor', () => {
    const result = transformEditorData({
      editor: 'nienow.grid',
      version: 1,
      rows: 2,
      columns: 2,
      sections: [
        [{title: 'title1', text: 'text1'}, {title: 'title2', text: 'text2'}],
        [{title: 'title3', text: 'text3'}, {title: 'title4', text: 'text4'}]
      ]
    });

    expect(result).toEqual({
      editor: 'nienow.sticky',
      version: 1,
      sections: {
        0: {index: 0, title: 'title1', text: 'text1'},
        1: {index: 1, title: 'title2', text: 'text2'},
        2: {index: 2, title: 'title3', text: 'text3'},
        3: {index: 3, title: 'title4', text: 'text4'}
      }
    });
  });
});
