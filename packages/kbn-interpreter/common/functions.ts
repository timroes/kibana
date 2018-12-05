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

 // tslint:disable

type TypeDef = 'string' | 'number' | 'boolean' | 'null';

type ArgumentType<T extends TypeDef> =
  (T extends 'string' ? string : never) |
  (T extends 'number' ? number : never) |
  (T extends 'boolean' ? boolean : never) |
  (T extends 'null' ? null : never);

interface ArgumentDefinition<Types extends Array<TypeDef>> {
  types: Types;
  aliases?: string[];
  multi?: boolean;
  help?: string;
  // Unfortunately the following typing doesn't properly validate
  default?: ArgumentType<Types[number]>
}

interface FunctionDefinition<
    T extends { [key: string]: ArgumentDefinition<TypeDef[]> },
    K extends keyof T
> {
  name: string;
  type: string;
  args: T;
  fn(args: {
    [k in K]: ArgumentType<T[k]['types'][number]>
  }): void;
}

function register<
    T extends { [key: string]: ArgumentDefinition<TypeDef[]> },
    K extends keyof T
>(
  registration: FunctionDefinition<T, K>
) {
  console.log(registration);
}

register({
  name: 'test',
  type: 'render',
  args: {
    foo: {
      types: ['string', 'number'],
      default:
    },
    bar: {
      types: ['number'],
    },
    baz: {
      types: ['string'],
    },
    notype: {
      types: []
    }
  },
  fn(args) {
    const { foo, bar, baz, notype } = args;
    // foo -> shows as ArgumentType<"string" | "number"> in editor
    //        but the type is equivalent to string | number
    // bar -> number
    // baz -> string
    // notype -> never
    console.log(args, foo, bar, baz, notype);
    // accepts(foo); 'string | number' is not assignable to string
    // accepts(bar); 'number' is not assignable to string
    acceptsString(baz);
    acceptsNumber(bar);
  },
});

function acceptsBoth(a: string | number) {}
function acceptsNumber(a: number) {}
function acceptsString(a: string) {}
