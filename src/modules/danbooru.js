import Danbooru from 'danbooru';
import fs from 'fs';
import flattenDeep from 'lodash.flattendeep';
import path from 'path';

import { req, wait } from '../util/functions';

const getImages = async ({ tags, unsafe }) => {
  const danbooru = unsafe ? new Danbooru() : new Danbooru.Safebooru();
  let count = 0;
  try {
    count = await danbooru.requestJson('GET counts/posts.json', { tags });
  } catch (e) {
    console.error(`    Danbooru tags search error: ${e}`);
    count = 0;
  }
  let results = [];

  if (!count || !count.counts || !count.counts.posts) return [];
  if (count.counts.posts < 100) {
    try {
      results = await danbooru.posts({ limit: 100, page: 1, tags });
    } catch (e) {
      console.error(`    Danbooru tags search error: ${e}`);
      results = [];
    }
  } else {
    const queries = [];
    for (let i = 1, len = Math.ceil(count.counts.posts / 100); i < len + 1; i += 1) {
      queries.push(
        danbooru.posts({ limit: 100, page: i, tags })
          .catch((e) => {
            console.error(`    Danbooru tags search error: ${e}`);
            return [];
          }),
      );
    }
    results = await Promise.all(queries);
  }

  return flattenDeep(results).map(post => `https://danbooru.donmai.us${post.raw.file_url}`);
};

const downloadImage = async (url, filepath, index) => {
  const file = `${filepath}/${index}${path.extname(url)}`;
  try {
    const data = await req(url, { encoding: null });
    fs.writeFileSync(file, data, 'binary');
  } catch (e) {
    console.error(`    Image (${url}) downloading error: ${e}`);
  }
  await wait(100);
};

export default { getImages, downloadImage };
