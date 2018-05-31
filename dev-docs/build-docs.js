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
const Handlebars = require('handlebars');
const MarkdownIt = require('markdown-it');
const _ = require('lodash');
const mkdirp = require('mkdirp');
const jsdoc = require('jsdoc-api');
const jsdoc2md = require('jsdoc-to-markdown');

const config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'config.yml')));
console.log(config);

function buildPage({ title, page }) {
  const content = fs.readFileSync(path.resolve(__dirname, '..', page), 'utf-8');
  const render = md.render(content);
  return render;
}

const templateContent = fs.readFileSync(path.resolve(__dirname, 'template/index.hbs'), 'utf-8');
const template = Handlebars.compile(templateContent);

function getSlug(group, page) {
  return `/${_.kebabCase(group.title)}/${_.kebabCase(page.title)}`;
}

const pageSlugs = {};
const jsdocs = {};

config.contents.forEach(group => {
  group.contents.forEach(page => {
    if (page.id) {
      pageSlugs[page.id] = getSlug(group, page);
    } else if (page.jsdoc) {
      jsdocs[page.jsdoc] = getSlug(group, page);
    }
  });
});

const md = new MarkdownIt({ html: true });

// Remember old renderer, if overriden, or proxy to default renderer
var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const href = tokens[idx].attrGet('href')
  if (href.startsWith('page:')) {
    const pageId = href.substr(5);
    tokens[idx].attrSet('href', pageSlugs[pageId]);
  }
  if (href.startsWith('jsdoc:')) {
    const jsdocId = href.substr(6);
    tokens[idx].attrSet('href', jsdocs[jsdocId]);
  }
  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

const toc = config.contents.map(group => {
  return {
    title: group.title,
    contents: group.contents.map(page => {
      return {
        ...page,
        isBeta: page.stage === 'beta',
        isExperimental: page.stage === 'experimental',
        slug: getSlug(group, page),
      };
    })
  };
});

toc.forEach(group => {
  group.contents.forEach(async page => {
    const pathname = path.resolve(__dirname, 'out', `.${page.slug}`);
    let context = {
      slug: page.slug,
    };

    if (page.page) {
      context.page = true;
      context.content = buildPage(page);
    } else if (page.jsdoc) {
      context.jsdocs = true;
      context.content = md.render(jsdoc2md.renderSync({ files: page.jsdoc }));
    } else if (page.swagger) {
      context.swagger = true;
      const filename = _.kebabCase(page.title);
      fs.createReadStream(path.resolve(__dirname, '..', page.swagger))
        .pipe(fs.createWriteStream(`${pathname}/${filename}.spec`));
      context.file = `${page.slug}/${filename}.spec`;
    }

    context.isBeta = page.isBeta;
    context.isExperimental = page.isExperimental;
    context.toc = toc;
    context.title = page.title;

    const compiled = template(context);
    await new Promise(resolve => mkdirp(pathname, resolve));
    fs.writeFileSync(`${pathname}/index.html`, compiled);
  });
});
