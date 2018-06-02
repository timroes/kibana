/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const webpack = require('webpack');
const jsdoc2md = require('jsdoc-to-markdown');
const getWebpackConfig = require('./webpack.config.js');

const config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'config.yml')));
console.log(config);

function getSlug(group, page) {
  return `/${_.kebabCase(group.title)}/${_.kebabCase(page.title)}`;
}

const pageSlugs = {};
const jsdocs = {};

config.contents.forEach(group => {
  group.items.forEach(page => {
    if (page.id) {
      pageSlugs[page.id] = getSlug(group, page);
    } else if (page.jsdoc) {
      jsdocs[page.jsdoc] = getSlug(group, page);
    }
  });
});

function getType(page) {
  if (page.markdown) {
    return 'markdown';
  } else if (page.swagger) {
    return 'swagger';
  } else if (page.jsdoc) {
    return 'jsdoc';
  } else {
    throw new Error(`The page ${page.title} is missing a proper type.`);
  }
}

const pages = {};
const types = {};

const toc = config.contents.map(group => {
  return {
    title: group.title,
    items: group.items.map(page => {
      const slug = getSlug(group, page);
      if (page.id) {
        pages[page.id] = {
          slug,
          title: page.title,
        };
      }
      if (page.jsdoc) {
        page.jsdoc = jsdoc2md.getTemplateDataSync({ files: page.jsdoc });
        page.jsdoc.forEach(jsdocEntry => {
          types[jsdocEntry.id] = slug;
        });
      }
      return {
        ...page,
        slug,
        type: getType(page),
      };
    })
  };
});

// Buid home page
// const homeMd = buildPage(config.home);
// const compiled = template({
//   toc,
//   content: homeMd,
// });
// fs.writeFileSync(path.resolve(__dirname, 'out/index.html'), compiled, 'utf-8');

toc.forEach(group => {
  group.items.forEach(async page => {
    const pathname = path.resolve(__dirname, 'out', `.${page.slug}`);
    await new Promise(resolve => mkdirp(pathname, resolve));
    const context = {
      page: { ...page },
    };

    if (page.markdown) {
      context.page.type = 'markdown';
      context.page.markdown = fs.readFileSync(path.resolve(__dirname, '..', page.markdown), 'utf-8');
    } else if (page.jsdoc) {
      context.page.type = 'jsdoc';
    } else if (page.swagger) {
      context.page.type = 'swagger';
      const specString = fs.readFileSync(path.resolve(__dirname, '..', page.swagger));
      const spec = yaml.safeLoad(specString);
      context.page.apiSpec = spec;
    }

    context.pages = pages;
    context.toc = toc;
    context.types = types;

    webpack(getWebpackConfig(page.slug, context), (err) => {
      console.log(err);
    });
  });
});
