(Files content cropped to 300k characters, download full ingest to see more)
================================================
File: README.md
================================================
# Google Gen AI SDK for TypeScript and JavaScript

[![NPM Downloads](https://img.shields.io/npm/dw/%40google%2Fgenai)](https://www.npmjs.com/package/@google/genai)
[![Node Current](https://img.shields.io/node/v/%40google%2Fgenai)](https://www.npmjs.com/package/@google/genai)

----------------------
**Documentation:** https://googleapis.github.io/js-genai/

----------------------

The Google Gen AI JavaScript SDK is designed for
TypeScript and JavaScript developers to build applications powered by Gemini. The SDK
supports both the [Gemini Developer API](https://ai.google.dev/gemini-api/docs)
and [Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview).

The Google Gen AI SDK is designed to work with Gemini 2.0 features.

> [!NOTE]
> **SDK Preview:**
> See: [Preview Launch](#preview-launch).

> [!CAUTION]
> **API Key Security:** Avoid exposing API keys in client-side code.
> Use server-side implementations in production environments.


## Prerequisites

* Node.js version 18 or later

## Installation

To install the SDK, run the following command:

```shell
npm install @google/genai
```

## Quickstart

The simplest way to get started is to using an API key from
[Google AI Studio](https://aistudio.google.com/apikey):

```typescript
import {GoogleGenAI} from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: 'Why is the sky blue?',
  });
  console.log(response.text);
}

main();
```

## Web quickstart

The package contents are also available unzipped in the
`package/` directory of the bucket, so an equivalent web example is:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Using My Package</title>
  </head>
  <body>
    <script type="module">
      import {GoogleGenAI} from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm'

          const ai = new GoogleGenAI({apiKey:"GEMINI_API_KEY"});

          async function main() {
            const response = await ai.models.generateContent({
              model: 'gemini-2.0-flash-001',
              contents: 'Why is the sky blue?',
            });
            console.log(response.text);
          }

          main();
    </script>
  </body>
</html>
```

## Initialization

The Google Gen AI SDK provides support for both the
[Google AI Studio](https://ai.google.dev/gemini-api/docs) and
[Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)
 implementations of the Gemini API.

### Gemini Developer API

For server-side applications, initialize using an API key, which can
be acquired from [Google AI Studio](https://aistudio.google.com/apikey):

```typescript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
```

#### Browser

> [!CAUTION]
> **API Key Security:** Avoid exposing API keys in client-side code.
>   Use server-side implementations in production environments.

In the browser the initialization code is identical:


```typescript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
```

### Vertex AI

Sample code for VertexAI initialization:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    vertexai: true,
    project: 'your_project',
    location: 'your_location',
});
```

## GoogleGenAI overview

All API features are accessed through an instance of the `GoogleGenAI` classes.
The submodules bundle together related API methods:

- [`ai.models`](https://googleapis.github.io/js-genai/classes/models.Models.html):
  Use `models` to query models (`generateContent`, `generateImages`, ...), or
  examine their metadata.
- [`ai.caches`](https://googleapis.github.io/js-genai/classes/caches.Caches.html):
  Create and manage `caches` to reduce costs when repeatedly using the same
  large prompt prefix.
- [`ai.chats`](https://googleapis.github.io/js-genai/classes/chats.Chats.html):
  Create local stateful `chat` objects to simplify multi turn interactions.
- [`ai.files`](https://googleapis.github.io/js-genai/classes/files.Files.html):
  Upload `files` to the API and reference them in your prompts.
  This reduces bandwidth if you use a file many times, and handles files too
  large to fit inline with your prompt.
- [`ai.live`](https://googleapis.github.io/js-genai/classes/live.Live.html):
  Start a `live` session for real time interaction, allows text + audio + video
  input, and text or audio output.

## Samples

More samples can be found in the
[github samples directory](https://github.com/googleapis/js-genai/tree/main/sdk-samples).


### Streaming

For quicker, more responsive API interactions use the `generateContentStream`
method which yields chunks as they're generated:

```typescript
import {GoogleGenAI} from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function main() {
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-001',
    contents: 'Write a 100-word poem.',
  });
  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

main();
```

### Function Calling

To let Gemini to interact with external systems, you can provide provide
`functionDeclaration` objects as `tools`. To use these tools it's a 4 step

1. **Declare the function name, description, and parameters**
2. **Call `generateContent` with function calling enabled**
3. **Use the returned `FunctionCall` parameters to call your actual function**
3. **Send the result back to the model (with history, easier in `ai.chat`)
   as a `FunctionResponse`**

```typescript
import {GoogleGenAI, FunctionCallingConfigMode, FunctionDeclaration, Type} from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function main() {
  const controlLightDeclaration: FunctionDeclaration = {
    name: 'controlLight',
    parameters: {
      type: Type.OBJECT,
      description: 'Set the brightness and color temperature of a room light.',
      properties: {
        brightness: {
          type: Type.NUMBER,
          description:
              'Light level from 0 to 100. Zero is off and 100 is full brightness.',
        },
        colorTemperature: {
          type: Type.STRING,
          description:
              'Color temperature of the light fixture which can be `daylight`, `cool`, or `warm`.',
        },
      },
      required: ['brightness', 'colorTemperature'],
    },
  };

  const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: 'Dim the lights so the room feels cozy and warm.',
    config: {
      toolConfig: {
        functionCallingConfig: {
          // Force it to call any function
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['controlLight'],
        }
      },
      tools: [{functionDeclarations: [controlLightDeclaration]}]
    }
  });

  console.log(response.functionCalls);
}

main();
```


## Preview Launch

The SDK is curently in a preview launch stage, per [Google's launch stages](https://cloud.google.com/products?hl=en#section-22) this means:

> At Preview, products or features are ready for testing by customers. Preview offerings are often publicly announced, but are not necessarily feature-complete, and no SLAs or technical support commitments are provided for these. Unless stated otherwise by Google, Preview offerings are intended for use in test environments only. The average Preview stage lasts about six months.




================================================
File: CHANGELOG.md
================================================
# Changelog


## [0.6.0](https://github.com/googleapis/js-genai/compare/v0.5.0...v0.6.0) (2025-03-20)


### ⚠ BREAKING CHANGES

* Unexport Content converter functions

### Features

* add IMAGE_SAFTY enum value to FinishReason ([81ae907](https://github.com/googleapis/js-genai/commit/81ae907a997d6f2e0a98d6b06906fdcfc0bb3770))


### Code Refactoring

* Separate converter functions to dedicated _{module}_converters.ts file for readability ([bb9ba98](https://github.com/googleapis/js-genai/commit/bb9ba987ffb1cd55647c0a2adaee9b7096b0b974))

## [0.5.0](https://github.com/googleapis/js-genai/compare/v0.4.0...v0.5.0) (2025-03-20)


### ⚠ BREAKING CHANGES

* Make "turnComplete:true" the default.

### Features

* Add sendClientContent, sendRealtimeInput, sendToolResponse to live session ([e7ec3c0](https://github.com/googleapis/js-genai/commit/e7ec3c087f628faea7c689e36a46a17e9530ead2))
* Make "turnComplete:true" the default. ([5f77e3e](https://github.com/googleapis/js-genai/commit/5f77e3e05c8ab95907082921eb99728b46503766))
* Support Google Cloud Express for Vertex AI ([e15c7f3](https://github.com/googleapis/js-genai/commit/e15c7f3675cbf703341ed3a39a75c038f07eb687))
* support new UsageMetadata fields ([fe000ed](https://github.com/googleapis/js-genai/commit/fe000ed1c8b74fd274d0bfae1271c317c232cb28))
* Support Vertex AI on browser runtimes ([e15c7f3](https://github.com/googleapis/js-genai/commit/e15c7f3675cbf703341ed3a39a75c038f07eb687))
* Upgrade the SDK launch stage to preview. ([da38b6d](https://github.com/googleapis/js-genai/commit/da38b6df88705c8ff1ea9a2e1c5ffa596054b382))

## [0.4.0](https://github.com/googleapis/js-genai/compare/v0.3.1...v0.4.0) (2025-03-14)


### ⚠ BREAKING CHANGES

* remove the createPartFromVideoMetadata usability function.

### Features

* enable union type for Schema when calling Gemini API. ([180983c](https://github.com/googleapis/js-genai/commit/180983c05857344d00133561aeae1e7a46e3475a))
* Provide a better error message when trying to use VertexAI in browsers. ([1ab1402](https://github.com/googleapis/js-genai/commit/1ab14020720e6d0bb47da7785b74aa06fffafca2))
* Support returned safety attributes for generate_images ([a0e0fcf](https://github.com/googleapis/js-genai/commit/a0e0fcfae5b9f6be4d2c9bd2466c91628bfd8623))
* throw exception when given method is not supported in Gemini API or Vertex AI ([96ccb6f](https://github.com/googleapis/js-genai/commit/96ccb6f9d578749fb485735be7f1b164da444029))


### Bug Fixes

* remove the createPartFromVideoMetadata usability function. ([d660a7f](https://github.com/googleapis/js-genai/commit/d660a7f57d3d54239a30fca0a2aeb486b476e7e5))

## 0.3.1 (2025-03-11)

## 0.3.0 (2025-03-11)


### ⚠ BREAKING CHANGES

* Make file.upload use named parameters.

### Features

* Enable Live for Vertex AI. ([2bda9d4](https://github.com/googleapis/js-genai/commit/2bda9d407712fbdab127ee7797572ac520b32423))


### Bug Fixes


* Set web as the browser entry points for bundlers that don't support the exports key ([18cb728](https://github.com/googleapis/js-genai/commit/18cb7283665f42fc9c7243ad9b82545c551e7444))

### Miscellaneous Chores

* Make file.upload use named parameters. ([60433f4](https://github.com/googleapis/js-genai/commit/60433f41b770d3c0a1e3cbbb50a2cea985396426))



================================================
File: CONTRIBUTING.md
================================================
# Contributing

The Google Gen AI SDK is will accept contributions in the future.


================================================
File: LICENSE
================================================

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.



================================================
File: eslint.config.mjs
================================================
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      // Ignore built files.
      'dist/**',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
        },
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          'allowInterfaces': 'always',
        },
      ],
    },
  },
];



================================================
File: rollup.config.mjs
================================================
import json from '@rollup/plugin-json';
import {readFileSync} from 'fs';
import typescript from 'rollup-plugin-typescript2';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const rollupPlugins = [
  typescript({
    tsconfigOverride: {
      exclude: ['test/**'],
    },
  }),
  json({
    preferConst: true,
  }),
];

const externalDeps = ['google-auth-library', 'ws', 'fs/promises'];

export default [
  // ES module (dist/index.mjs)
  {
    input: 'src/index.ts',
    output: {
      file: pkg.exports['.']['import'],
      format: 'es',
      sourcemap: true,
    },
    plugins: rollupPlugins,
    external: externalDeps,
  },

  // CommonJS module (dist/index.js)
  {
    input: 'src/index.ts',
    output: {
      file: pkg.exports['.']['require'],
      format: 'cjs',
      sourcemap: true,
    },
    plugins: rollupPlugins,
    external: externalDeps,
  },

  // The `node/` module, commonjs only (dist/node/index.js)
  {
    input: 'src/node/index.ts',
    output: {
      file: pkg.exports['./node']['require'],
      format: 'cjs',
      sourcemap: true,
    },
    plugins: rollupPlugins,
    external: externalDeps,
  },

  // The `web/` module, ES module only (dist/web/index.js)
  {
    input: 'src/web/index.ts',
    output: {
      file: pkg.exports['./web']['import'],
      format: 'es',
      sourcemap: true,
    },
    plugins: rollupPlugins,
    external: externalDeps,
  },
];



================================================
File: .prettierignore
================================================
# Ignore autogenerated files:
src/caches.ts
src/files.ts
src/models.ts
src/tunings.ts
src/types.ts
# Ignore built files:
dist/**


================================================
File: .prettierrc
================================================
{
  "printWidth" : 80,
  "tabWidth" : 2,
  "useTabs" : false,
  "semi" : true,
  "singleQuote" : true,
  "quoteProps" : "preserve",
  "bracketSpacing" : false,
  "trailingComma" : "all",
  "arrowParens" : "always",
  "embeddedLanguageFormatting" : "off",
  "bracketSameLine" : true,
  "singleAttributePerLine" : false,
  "htmlWhitespaceSensitivity" : "strict",
  "plugins": ["prettier-plugin-organize-imports"],
}



================================================
File: api-report/README.md
================================================
## API Extractor API reports

This folder contains the API reports produced by API extractor at build time. All files in this folder are auto-generated.

Tracking these reports in source control helps us ensure public API changes didn't go unnoticed: If a commit changes this folder it changed the public API of the package.



================================================
File: api-report/genai-node.api.md
================================================
## API Report File for "@google/genai"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { GoogleAuthOptions } from 'google-auth-library';

// @public
interface Blob_2 {
    data?: string;
    mimeType?: string;
}
export { Blob_2 as Blob }

// @public (undocumented)
export enum BlockedReason {
    // (undocumented)
    BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED",
    // (undocumented)
    BLOCKLIST = "BLOCKLIST",
    // (undocumented)
    OTHER = "OTHER",
    // (undocumented)
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT",
    // (undocumented)
    SAFETY = "SAFETY"
}

// @public
export interface CachedContent {
    createTime?: string;
    displayName?: string;
    expireTime?: string;
    model?: string;
    name?: string;
    updateTime?: string;
    usageMetadata?: CachedContentUsageMetadata;
}

// @public
export interface CachedContentUsageMetadata {
    audioDurationSeconds?: number;
    imageCount?: number;
    textCount?: number;
    totalTokenCount?: number;
    videoDurationSeconds?: number;
}

// Warning: (ae-forgotten-export) The symbol "BaseModule" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export class Caches extends BaseModule {
    // Warning: (ae-forgotten-export) The symbol "ApiClient" needs to be exported by the entry point index.d.ts
    constructor(apiClient: ApiClient);
    create(params: types.CreateCachedContentParameters): Promise<types.CachedContent>;
    delete(params: types.DeleteCachedContentParameters): Promise<types.DeleteCachedContentResponse>;
    get(params: types.GetCachedContentParameters): Promise<types.CachedContent>;
    // Warning: (ae-forgotten-export) The symbol "types" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "Pager" needs to be exported by the entry point index.d.ts
    list: (params?: types.ListCachedContentsParameters) => Promise<Pager<types.CachedContent>>;
    update(params: types.UpdateCachedContentParameters): Promise<types.CachedContent>;
}

// @public
export interface Candidate {
    avgLogprobs?: number;
    citationMetadata?: CitationMetadata;
    content?: Content;
    finishMessage?: string;
    finishReason?: FinishReason;
    groundingMetadata?: GroundingMetadata;
    index?: number;
    logprobsResult?: LogprobsResult;
    safetyRatings?: SafetyRating[];
    tokenCount?: number;
}

// @public
export class Chat {
    constructor(apiClient: ApiClient, modelsModule: Models, model: string, config?: types.GenerateContentConfig, history?: types.Content[]);
    getHistory(curated?: boolean): types.Content[];
    sendMessage(params: types.SendMessageParameters): Promise<types.GenerateContentResponse>;
    sendMessageStream(params: types.SendMessageParameters): Promise<AsyncGenerator<types.GenerateContentResponse>>;
}

// @public
export class Chats {
    constructor(modelsModule: Models, apiClient: ApiClient);
    create(params: types.CreateChatParameters): Chat;
}

// @public
export interface Citation {
    endIndex?: number;
    license?: string;
    publicationDate?: GoogleTypeDate;
    startIndex?: number;
    title?: string;
    uri?: string;
}

// @public
export interface CitationMetadata {
    citations?: Citation[];
}

// @public
export interface CodeExecutionResult {
    outcome?: Outcome;
    output?: string;
}

// @public
export interface ComputeTokensConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface ComputeTokensParameters {
    config?: ComputeTokensConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class ComputeTokensResponse {
    tokensInfo?: TokensInfo[];
}

// @public
export interface Content {
    parts?: Part[];
    role?: string;
}

// @public
export interface ContentEmbedding {
    statistics?: ContentEmbeddingStatistics;
    values?: number[];
}

// @public
export interface ContentEmbeddingStatistics {
    tokenCount?: number;
    truncated?: boolean;
}

// @public (undocumented)
export type ContentListUnion = ContentUnion[] | ContentUnion;

// @public (undocumented)
export type ContentUnion = Content | PartUnion[] | PartUnion;

// @public
export interface ControlReferenceConfig {
    controlType?: ControlReferenceType;
    enableControlImageComputation?: boolean;
}

// @public
export interface ControlReferenceImage {
    config?: ControlReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum ControlReferenceType {
    // (undocumented)
    CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY",
    // (undocumented)
    CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT",
    // (undocumented)
    CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH",
    // (undocumented)
    CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE"
}

// @public
export interface CountTokensConfig {
    generationConfig?: GenerationConfig;
    httpOptions?: HttpOptions;
    systemInstruction?: ContentUnion;
    tools?: Tool[];
}

// @public
export interface CountTokensParameters {
    config?: CountTokensConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class CountTokensResponse {
    cachedContentTokenCount?: number;
    totalTokens?: number;
}

// @public
export interface CreateCachedContentConfig {
    contents?: ContentListUnion;
    displayName?: string;
    expireTime?: string;
    httpOptions?: HttpOptions;
    systemInstruction?: ContentUnion;
    toolConfig?: ToolConfig;
    tools?: Tool[];
    ttl?: string;
}

// @public
export interface CreateCachedContentParameters {
    config?: CreateCachedContentConfig;
    model: string;
}

// @public
export interface CreateChatParameters {
    config?: GenerateContentConfig;
    history?: Content[];
    model: string;
}

// @public
export interface CreateFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface CreateFileParameters {
    config?: CreateFileConfig;
    file: File_2;
}

// @public
export class CreateFileResponse {
    sdkHttpResponse?: HttpResponse;
}

// @public
export function createModelContent(partOrString: PartListUnion | string): Content;

// @public
export function createPartFromBase64(data: string, mimeType: string): Part;

// @public
export function createPartFromCodeExecutionResult(outcome: Outcome, output: string): Part;

// @public
export function createPartFromExecutableCode(code: string, language: Language): Part;

// @public
export function createPartFromFunctionCall(name: string, args: Record<string, unknown>): Part;

// @public
export function createPartFromFunctionResponse(id: string, name: string, response: Record<string, unknown>): Part;

// @public
export function createPartFromText(text: string): Part;

// @public
export function createPartFromUri(uri: string, mimeType: string): Part;

// @public
export function createUserContent(partOrString: PartListUnion | string): Content;

// @public
export interface DeleteCachedContentConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface DeleteCachedContentParameters {
    config?: DeleteCachedContentConfig;
    name: string;
}

// @public
export class DeleteCachedContentResponse {
}

// @public
export interface DownloadFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface DynamicRetrievalConfig {
    dynamicThreshold?: number;
    mode?: DynamicRetrievalConfigMode;
}

// @public (undocumented)
export enum DynamicRetrievalConfigMode {
    // (undocumented)
    MODE_DYNAMIC = "MODE_DYNAMIC",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED"
}

// @public (undocumented)
export interface EmbedContentConfig {
    autoTruncate?: boolean;
    httpOptions?: HttpOptions;
    mimeType?: string;
    outputDimensionality?: number;
    taskType?: string;
    title?: string;
}

// @public
export interface EmbedContentMetadata {
    billableCharacterCount?: number;
}

// @public
export interface EmbedContentParameters {
    config?: EmbedContentConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class EmbedContentResponse {
    embeddings?: ContentEmbedding[];
    metadata?: EmbedContentMetadata;
}

// @public
export interface ExecutableCode {
    code?: string;
    language?: Language;
}

// @public
interface File_2 {
    createTime?: string;
    displayName?: string;
    downloadUri?: string;
    error?: FileStatus;
    expirationTime?: string;
    mimeType?: string;
    name?: string;
    sha256Hash?: string;
    sizeBytes?: number;
    source?: FileSource;
    state?: FileState;
    updateTime?: string;
    uri?: string;
    videoMetadata?: Record<string, unknown>;
}
export { File_2 as File }

// @public
export interface FileData {
    fileUri?: string;
    mimeType?: string;
}

// @public (undocumented)
export enum FileSource {
    // (undocumented)
    GENERATED = "GENERATED",
    // (undocumented)
    SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED",
    // (undocumented)
    UPLOADED = "UPLOADED"
}

// @public (undocumented)
export enum FileState {
    // (undocumented)
    ACTIVE = "ACTIVE",
    // (undocumented)
    FAILED = "FAILED",
    // (undocumented)
    PROCESSING = "PROCESSING",
    // (undocumented)
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED"
}

// @public
export interface FileStatus {
    code?: number;
    details?: Record<string, unknown>[];
    message?: string;
}

// @public (undocumented)
export enum FinishReason {
    // (undocumented)
    BLOCKLIST = "BLOCKLIST",
    // (undocumented)
    FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED",
    // (undocumented)
    IMAGE_SAFETY = "IMAGE_SAFETY",
    // (undocumented)
    MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL",
    // (undocumented)
    MAX_TOKENS = "MAX_TOKENS",
    // (undocumented)
    OTHER = "OTHER",
    // (undocumented)
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT",
    // (undocumented)
    RECITATION = "RECITATION",
    // (undocumented)
    SAFETY = "SAFETY",
    // (undocumented)
    SPII = "SPII",
    // (undocumented)
    STOP = "STOP"
}

// @public
export interface FunctionCall {
    args?: Record<string, unknown>;
    id?: string;
    name?: string;
}

// @public
export interface FunctionCallingConfig {
    allowedFunctionNames?: string[];
    mode?: FunctionCallingConfigMode;
}

// @public (undocumented)
export enum FunctionCallingConfigMode {
    // (undocumented)
    ANY = "ANY",
    // (undocumented)
    AUTO = "AUTO",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED",
    // (undocumented)
    NONE = "NONE"
}

// @public
export interface FunctionDeclaration {
    description?: string;
    name?: string;
    parameters?: Schema;
    response?: Schema;
}

// @public
export class FunctionResponse {
    id?: string;
    name?: string;
    response?: Record<string, unknown>;
}

// @public
export interface GenerateContentConfig {
    audioTimestamp?: boolean;
    cachedContent?: string;
    candidateCount?: number;
    frequencyPenalty?: number;
    httpOptions?: HttpOptions;
    labels?: Record<string, string>;
    logprobs?: number;
    maxOutputTokens?: number;
    mediaResolution?: MediaResolution;
    presencePenalty?: number;
    responseLogprobs?: boolean;
    responseMimeType?: string;
    responseModalities?: string[];
    responseSchema?: SchemaUnion;
    routingConfig?: GenerationConfigRoutingConfig;
    safetySettings?: SafetySetting[];
    seed?: number;
    speechConfig?: SpeechConfigUnion;
    stopSequences?: string[];
    systemInstruction?: ContentUnion;
    temperature?: number;
    thinkingConfig?: ThinkingConfig;
    toolConfig?: ToolConfig;
    tools?: ToolListUnion;
    topK?: number;
    topP?: number;
}

// @public
export interface GenerateContentParameters {
    config?: GenerateContentConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class GenerateContentResponse {
    candidates?: Candidate[];
    get codeExecutionResult(): string | undefined;
    createTime?: string;
    get executableCode(): string | undefined;
    get functionCalls(): FunctionCall[] | undefined;
    modelVersion?: string;
    promptFeedback?: GenerateContentResponsePromptFeedback;
    responseId?: string;
    get text(): string | undefined;
    usageMetadata?: GenerateContentResponseUsageMetadata;
}

// @public
export class GenerateContentResponsePromptFeedback {
    blockReason?: BlockedReason;
    blockReasonMessage?: string;
    safetyRatings?: SafetyRating[];
}

// @public
export class GenerateContentResponseUsageMetadata {
    cachedContentTokenCount?: number;
    cacheTokensDetails?: ModalityTokenCount[];
    candidatesTokenCount?: number;
    candidatesTokensDetails?: ModalityTokenCount[];
    promptTokenCount?: number;
    promptTokensDetails?: ModalityTokenCount[];
    thoughtsTokenCount?: number;
    toolUsePromptTokenCount?: number;
    toolUsePromptTokensDetails?: ModalityTokenCount[];
    totalTokenCount?: number;
}

// @public
export interface GeneratedImage {
    enhancedPrompt?: string;
    image?: Image_2;
    raiFilteredReason?: string;
    safetyAttributes?: SafetyAttributes;
}

// @public
export interface GenerateImagesConfig {
    addWatermark?: boolean;
    aspectRatio?: string;
    enhancePrompt?: boolean;
    guidanceScale?: number;
    httpOptions?: HttpOptions;
    includeRaiReason?: boolean;
    includeSafetyAttributes?: boolean;
    language?: ImagePromptLanguage;
    negativePrompt?: string;
    numberOfImages?: number;
    outputCompressionQuality?: number;
    outputGcsUri?: string;
    outputMimeType?: string;
    personGeneration?: PersonGeneration;
    safetyFilterLevel?: SafetyFilterLevel;
    seed?: number;
}

// @public
export interface GenerateImagesParameters {
    config?: GenerateImagesConfig;
    model: string;
    prompt: string;
}

// @public
export class GenerateImagesResponse {
    generatedImages?: GeneratedImage[];
    positivePromptSafetyAttributes?: SafetyAttributes;
}

// @public
export interface GenerationConfig {
    audioTimestamp?: boolean;
    candidateCount?: number;
    frequencyPenalty?: number;
    logprobs?: number;
    maxOutputTokens?: number;
    presencePenalty?: number;
    responseLogprobs?: boolean;
    responseMimeType?: string;
    responseSchema?: Schema;
    routingConfig?: GenerationConfigRoutingConfig;
    seed?: number;
    stopSequences?: string[];
    temperature?: number;
    topK?: number;
    topP?: number;
}

// @public
export interface GenerationConfigRoutingConfig {
    autoMode?: GenerationConfigRoutingConfigAutoRoutingMode;
    manualMode?: GenerationConfigRoutingConfigManualRoutingMode;
}

// @public
export interface GenerationConfigRoutingConfigAutoRoutingMode {
    modelRoutingPreference?: 'UNKNOWN' | 'PRIORITIZE_QUALITY' | 'BALANCED' | 'PRIORITIZE_COST';
}

// @public
export interface GenerationConfigRoutingConfigManualRoutingMode {
    modelName?: string;
}

// @public
export interface GetCachedContentConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface GetCachedContentParameters {
    config?: GetCachedContentConfig;
    name: string;
}

// @public
export interface GetFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface GetFileParameters {
    config?: GetFileConfig;
    name: string;
}

// @public
export class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    // (undocumented)
    protected readonly apiClient: ApiClient;
    // (undocumented)
    readonly caches: Caches;
    // (undocumented)
    readonly chats: Chats;
    // Warning: (ae-forgotten-export) The symbol "Files" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly files: Files;
    // (undocumented)
    readonly live: Live;
    // (undocumented)
    readonly models: Models;
    // (undocumented)
    readonly vertexai: boolean;
}

// @public
export interface GoogleGenAIOptions {
    apiKey?: string;
    apiVersion?: string;
    googleAuthOptions?: GoogleAuthOptions;
    httpOptions?: HttpOptions;
    location?: string;
    project?: string;
    vertexai?: boolean;
}

// @public
export interface GoogleSearch {
}

// @public
export interface GoogleSearchRetrieval {
    dynamicRetrievalConfig?: DynamicRetrievalConfig;
}

// @public
export interface GoogleTypeDate {
    day?: number;
    month?: number;
    year?: number;
}

// @public
export interface GroundingChunk {
    retrievedContext?: GroundingChunkRetrievedContext;
    web?: GroundingChunkWeb;
}

// @public
export interface GroundingChunkRetrievedContext {
    text?: string;
    title?: string;
    uri?: string;
}

// @public
export interface GroundingChunkWeb {
    title?: string;
    uri?: string;
}

// @public
export interface GroundingMetadata {
    groundingChunks?: GroundingChunk[];
    groundingSupports?: GroundingSupport[];
    retrievalMetadata?: RetrievalMetadata;
    retrievalQueries?: string[];
    searchEntryPoint?: SearchEntryPoint;
    webSearchQueries?: string[];
}

// @public
export interface GroundingSupport {
    confidenceScores?: number[];
    groundingChunkIndices?: number[];
    segment?: Segment;
}

// @public (undocumented)
export enum HarmBlockMethod {
    // (undocumented)
    HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED",
    // (undocumented)
    PROBABILITY = "PROBABILITY",
    // (undocumented)
    SEVERITY = "SEVERITY"
}

// @public (undocumented)
export enum HarmBlockThreshold {
    // (undocumented)
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    // (undocumented)
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    // (undocumented)
    BLOCK_NONE = "BLOCK_NONE",
    // (undocumented)
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
    // (undocumented)
    HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
    // (undocumented)
    OFF = "OFF"
}

// @public (undocumented)
export enum HarmCategory {
    // (undocumented)
    HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY",
    // (undocumented)
    HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT",
    // (undocumented)
    HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT",
    // (undocumented)
    HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH",
    // (undocumented)
    HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    // (undocumented)
    HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED"
}

// @public (undocumented)
export enum HarmProbability {
    // (undocumented)
    HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED",
    // (undocumented)
    HIGH = "HIGH",
    // (undocumented)
    LOW = "LOW",
    // (undocumented)
    MEDIUM = "MEDIUM",
    // (undocumented)
    NEGLIGIBLE = "NEGLIGIBLE"
}

// @public (undocumented)
export enum HarmSeverity {
    // (undocumented)
    HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH",
    // (undocumented)
    HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW",
    // (undocumented)
    HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM",
    // (undocumented)
    HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE",
    // (undocumented)
    HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED"
}

// @public
export interface HttpOptions {
    apiVersion?: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
}

// @public
export class HttpResponse {
    constructor(response: Response);
    headers?: Record<string, string>;
    // (undocumented)
    json(): Promise<unknown>;
    responseInternal: Response;
}

// @public
interface Image_2 {
    gcsUri?: string;
    imageBytes?: string;
    mimeType?: string;
}
export { Image_2 as Image }

// @public (undocumented)
export enum ImagePromptLanguage {
    // (undocumented)
    auto = "auto",
    // (undocumented)
    en = "en",
    // (undocumented)
    hi = "hi",
    // (undocumented)
    ja = "ja",
    // (undocumented)
    ko = "ko"
}

// @public (undocumented)
export enum Language {
    // (undocumented)
    LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED",
    // (undocumented)
    PYTHON = "PYTHON"
}

// @public
export interface ListCachedContentsConfig {
    httpOptions?: HttpOptions;
    // (undocumented)
    pageSize?: number;
    // (undocumented)
    pageToken?: string;
}

// @public
export interface ListCachedContentsParameters {
    config?: ListCachedContentsConfig;
}

// @public (undocumented)
export class ListCachedContentsResponse {
    cachedContents?: CachedContent[];
    // (undocumented)
    nextPageToken?: string;
}

// @public
export interface ListFilesConfig {
    httpOptions?: HttpOptions;
    // (undocumented)
    pageSize?: number;
    // (undocumented)
    pageToken?: string;
}

// @public
export interface ListFilesParameters {
    config?: ListFilesConfig;
}

// @public
export class ListFilesResponse {
    files?: File_2[];
    nextPageToken?: string;
}

// @public
export class Live {
    // Warning: (ae-forgotten-export) The symbol "Auth" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "WebSocketFactory" needs to be exported by the entry point index.d.ts
    constructor(apiClient: ApiClient, auth: Auth, webSocketFactory: WebSocketFactory);
    connect(params: types.LiveConnectParameters): Promise<Session>;
}

// @public
export interface LiveCallbacks {
    // (undocumented)
    onclose?: ((e: CloseEvent) => void) | null;
    // (undocumented)
    onerror?: ((e: ErrorEvent) => void) | null;
    // (undocumented)
    onmessage: (e: LiveServerMessage) => void;
    // (undocumented)
    onopen?: (() => void) | null;
}

// @public
export interface LiveClientContent {
    turnComplete?: boolean;
    turns?: Content[];
}

// @public
export interface LiveClientMessage {
    clientContent?: LiveClientContent;
    realtimeInput?: LiveClientRealtimeInput;
    setup?: LiveClientSetup;
    toolResponse?: LiveClientToolResponse;
}

// @public
export interface LiveClientRealtimeInput {
    mediaChunks?: Blob_2[];
}

// @public
export interface LiveClientSetup {
    generationConfig?: GenerationConfig;
    model?: string;
    systemInstruction?: Content;
    tools?: ToolListUnion;
}

// @public
export class LiveClientToolResponse {
    functionResponses?: FunctionResponse[];
}

// @public
export interface LiveConnectConfig {
    generationConfig?: GenerationConfig;
    responseModalities?: Modality[];
    speechConfig?: SpeechConfig;
    systemInstruction?: Content;
    tools?: ToolListUnion;
}

// @public
export interface LiveConnectParameters {
    callbacks: LiveCallbacks;
    config?: LiveConnectConfig;
    model: string;
}

// @public
export interface LiveSendClientContentParameters {
    turnComplete?: boolean;
    turns?: ContentListUnion;
}

// @public
export interface LiveSendRealtimeInputParameters {
    media: Blob_2;
}

// @public
export class LiveSendToolResponseParameters {
    functionResponses: FunctionResponse[] | FunctionResponse;
}

// @public
export interface LiveServerContent {
    interrupted?: boolean;
    modelTurn?: Content;
    turnComplete?: boolean;
}

// @public
export interface LiveServerMessage {
    serverContent?: LiveServerContent;
    setupComplete?: LiveServerSetupComplete;
    toolCall?: LiveServerToolCall;
    toolCallCancellation?: LiveServerToolCallCancellation;
}

// @public
export interface LiveServerSetupComplete {
}

// @public
export interface LiveServerToolCall {
    functionCalls?: FunctionCall[];
}

// @public
export interface LiveServerToolCallCancellation {
    ids?: string[];
}

// @public
export interface LogprobsResult {
    chosenCandidates?: LogprobsResultCandidate[];
    topCandidates?: LogprobsResultTopCandidates[];
}

// @public
export interface LogprobsResultCandidate {
    logProbability?: number;
    token?: string;
    tokenId?: number;
}

// @public
export interface LogprobsResultTopCandidates {
    candidates?: LogprobsResultCandidate[];
}

// @public
export interface MaskReferenceConfig {
    maskDilation?: number;
    maskMode?: MaskReferenceMode;
    segmentationClasses?: number[];
}

// @public
export interface MaskReferenceImage {
    config?: MaskReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum MaskReferenceMode {
    // (undocumented)
    MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND",
    // (undocumented)
    MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT",
    // (undocumented)
    MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND",
    // (undocumented)
    MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC",
    // (undocumented)
    MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED"
}

// @public (undocumented)
export enum MediaResolution {
    // (undocumented)
    MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH",
    // (undocumented)
    MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW",
    // (undocumented)
    MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM",
    // (undocumented)
    MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED"
}

// @public (undocumented)
export enum Modality {
    // (undocumented)
    AUDIO = "AUDIO",
    // (undocumented)
    IMAGE = "IMAGE",
    // (undocumented)
    MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED",
    // (undocumented)
    TEXT = "TEXT"
}

// @public
export interface ModalityTokenCount {
    modality?: Modality;
    tokenCount?: number;
}

// @public (undocumented)
export enum Mode {
    // (undocumented)
    MODE_DYNAMIC = "MODE_DYNAMIC",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED"
}

// @public (undocumented)
export class Models extends BaseModule {
    constructor(apiClient: ApiClient);
    computeTokens(params: types.ComputeTokensParameters): Promise<types.ComputeTokensResponse>;
    countTokens(params: types.CountTokensParameters): Promise<types.CountTokensResponse>;
    embedContent(params: types.EmbedContentParameters): Promise<types.EmbedContentResponse>;
    generateContent: (params: types.GenerateContentParameters) => Promise<types.GenerateContentResponse>;
    generateContentStream: (params: types.GenerateContentParameters) => Promise<AsyncGenerator<types.GenerateContentResponse>>;
    generateImages: (params: types.GenerateImagesParameters) => Promise<types.GenerateImagesResponse>;
}

// @public
export enum Outcome {
    // (undocumented)
    OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED",
    // (undocumented)
    OUTCOME_FAILED = "OUTCOME_FAILED",
    // (undocumented)
    OUTCOME_OK = "OUTCOME_OK",
    // (undocumented)
    OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED"
}

// @public
export interface Part {
    codeExecutionResult?: CodeExecutionResult;
    executableCode?: ExecutableCode;
    fileData?: FileData;
    functionCall?: FunctionCall;
    functionResponse?: FunctionResponse;
    inlineData?: Blob_2;
    text?: string;
    thought?: boolean;
    videoMetadata?: VideoMetadata;
}

// @public (undocumented)
export type PartListUnion = PartUnion[] | PartUnion;

// @public (undocumented)
export type PartUnion = Part | string;

// @public (undocumented)
export enum PersonGeneration {
    // (undocumented)
    ALLOW_ADULT = "ALLOW_ADULT",
    // (undocumented)
    ALLOW_ALL = "ALLOW_ALL",
    // (undocumented)
    DONT_ALLOW = "DONT_ALLOW"
}

// @public
export interface PrebuiltVoiceConfig {
    voiceName?: string;
}

// @public
export interface RawReferenceImage {
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public
export interface ReplayFile {
    // (undocumented)
    interactions?: ReplayInteraction[];
    // (undocumented)
    replayId?: string;
}

// @public
export interface ReplayInteraction {
    // (undocumented)
    request?: ReplayRequest;
    // (undocumented)
    response?: ReplayResponse;
}

// @public
export interface ReplayRequest {
    // (undocumented)
    bodySegments?: Record<string, unknown>[];
    // (undocumented)
    headers?: Record<string, string>;
    // (undocumented)
    method?: string;
    // (undocumented)
    url?: string;
}

// @public
export class ReplayResponse {
    // (undocumented)
    bodySegments?: Record<string, unknown>[];
    // (undocumented)
    headers?: Record<string, string>;
    // (undocumented)
    sdkResponseSegments?: Record<string, unknown>[];
    // (undocumented)
    statusCode?: number;
}

// @public
export interface Retrieval {
    disableAttribution?: boolean;
    vertexAiSearch?: VertexAISearch;
    vertexRagStore?: VertexRagStore;
}

// @public
export interface RetrievalMetadata {
    googleSearchDynamicRetrievalScore?: number;
}

// @public
export interface SafetyAttributes {
    categories?: string[];
    contentType?: string;
    scores?: number[];
}

// @public (undocumented)
export enum SafetyFilterLevel {
    // (undocumented)
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    // (undocumented)
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    // (undocumented)
    BLOCK_NONE = "BLOCK_NONE",
    // (undocumented)
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH"
}

// @public
export interface SafetyRating {
    blocked?: boolean;
    category?: HarmCategory;
    probability?: HarmProbability;
    probabilityScore?: number;
    severity?: HarmSeverity;
    severityScore?: number;
}

// @public
export interface SafetySetting {
    category?: HarmCategory;
    method?: HarmBlockMethod;
    threshold?: HarmBlockThreshold;
}

// @public
export interface Schema {
    anyOf?: Schema[];
    default?: unknown;
    description?: string;
    enum?: string[];
    example?: unknown;
    format?: string;
    items?: Schema;
    maximum?: number;
    maxItems?: string;
    maxLength?: string;
    maxProperties?: string;
    minimum?: number;
    minItems?: string;
    minLength?: string;
    minProperties?: string;
    nullable?: boolean;
    pattern?: string;
    properties?: Record<string, Schema>;
    propertyOrdering?: string[];
    required?: string[];
    title?: string;
    type?: Type;
}

// @public (undocumented)
export type SchemaUnion = Schema;

// @public
export interface SearchEntryPoint {
    renderedContent?: string;
    sdkBlob?: string;
}

// @public
export interface Segment {
    endIndex?: number;
    partIndex?: number;
    startIndex?: number;
    text?: string;
}

// @public
export interface SendMessageParameters {
    config?: GenerateContentConfig;
    message: PartListUnion;
}

// @public
export class Session {
    constructor(conn: WebSocket_2, apiClient: ApiClient);
    close(): void;
    // Warning: (ae-forgotten-export) The symbol "WebSocket_2" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly conn: WebSocket_2;
    sendClientContent(params: types.LiveSendClientContentParameters): void;
    sendRealtimeInput(params: types.LiveSendRealtimeInputParameters): void;
    sendToolResponse(params: types.LiveSendToolResponseParameters): void;
}

// @public
export interface SpeechConfig {
    voiceConfig?: VoiceConfig;
}

// @public (undocumented)
export type SpeechConfigUnion = SpeechConfig | string;

// @public (undocumented)
export enum State {
    // (undocumented)
    ACTIVE = "ACTIVE",
    // (undocumented)
    ERROR = "ERROR",
    // (undocumented)
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED"
}

// @public
export interface StyleReferenceConfig {
    styleDescription?: string;
}

// @public
export interface StyleReferenceImage {
    config?: StyleReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public
export interface SubjectReferenceConfig {
    subjectDescription?: string;
    subjectType?: SubjectReferenceType;
}

// @public
export interface SubjectReferenceImage {
    config?: SubjectReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum SubjectReferenceType {
    // (undocumented)
    SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL",
    // (undocumented)
    SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT",
    // (undocumented)
    SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON",
    // (undocumented)
    SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT"
}

// @public (undocumented)
export interface TestTableFile {
    // (undocumented)
    comment?: string;
    // (undocumented)
    parameterNames?: string[];
    // (undocumented)
    testMethod?: string;
    // (undocumented)
    testTable?: TestTableItem[];
}

// @public (undocumented)
export interface TestTableItem {
    exceptionIfMldev?: string;
    exceptionIfVertex?: string;
    hasUnion?: boolean;
    ignoreKeys?: string[];
    name?: string;
    overrideReplayId?: string;
    parameters?: Record<string, unknown>;
    skipInApiMode?: string;
}

// @public
export interface ThinkingConfig {
    includeThoughts?: boolean;
}

// @public
export interface TokensInfo {
    role?: string;
    tokenIds?: string[];
    tokens?: string[];
}

// @public
export interface Tool {
    codeExecution?: ToolCodeExecution;
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: GoogleSearch;
    googleSearchRetrieval?: GoogleSearchRetrieval;
    retrieval?: Retrieval;
}

// @public
export interface ToolCodeExecution {
}

// @public
export interface ToolConfig {
    functionCallingConfig?: FunctionCallingConfig;
}

// @public (undocumented)
export type ToolListUnion = Tool[];

// @public (undocumented)
export enum Type {
    // (undocumented)
    ARRAY = "ARRAY",
    // (undocumented)
    BOOLEAN = "BOOLEAN",
    // (undocumented)
    INTEGER = "INTEGER",
    // (undocumented)
    NUMBER = "NUMBER",
    // (undocumented)
    OBJECT = "OBJECT",
    // (undocumented)
    STRING = "STRING",
    // (undocumented)
    TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED"
}

// @public
export interface UpdateCachedContentConfig {
    expireTime?: string;
    httpOptions?: HttpOptions;
    ttl?: string;
}

// @public (undocumented)
export interface UpdateCachedContentParameters {
    config?: UpdateCachedContentConfig;
    name: string;
}

// @public
export interface UploadFileConfig {
    displayName?: string;
    httpOptions?: HttpOptions;
    mimeType?: string;
    name?: string;
}

// @public
export interface UpscaleImageConfig {
    httpOptions?: HttpOptions;
    includeRaiReason?: boolean;
    outputCompressionQuality?: number;
    outputMimeType?: string;
}

// @public
export interface UpscaleImageParameters {
    config?: UpscaleImageConfig;
    image: Image_2;
    model: string;
    upscaleFactor: string;
}

// @public
export interface VertexAISearch {
    datastore?: string;
}

// @public
export interface VertexRagStore {
    ragCorpora?: string[];
    ragResources?: VertexRagStoreRagResource[];
    similarityTopK?: number;
    vectorDistanceThreshold?: number;
}

// @public
export interface VertexRagStoreRagResource {
    ragCorpus?: string;
    ragFileIds?: string[];
}

// @public
export interface VideoMetadata {
    endOffset?: string;
    startOffset?: string;
}

// @public
export interface VoiceConfig {
    prebuiltVoiceConfig?: PrebuiltVoiceConfig;
}

// (No @packageDocumentation comment for this package)

```



================================================
File: api-report/genai-web.api.md
================================================
## API Report File for "@google/genai"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { GoogleAuthOptions } from 'google-auth-library';

// @public
interface Blob_2 {
    data?: string;
    mimeType?: string;
}
export { Blob_2 as Blob }

// @public (undocumented)
export enum BlockedReason {
    // (undocumented)
    BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED",
    // (undocumented)
    BLOCKLIST = "BLOCKLIST",
    // (undocumented)
    OTHER = "OTHER",
    // (undocumented)
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT",
    // (undocumented)
    SAFETY = "SAFETY"
}

// @public
export interface CachedContent {
    createTime?: string;
    displayName?: string;
    expireTime?: string;
    model?: string;
    name?: string;
    updateTime?: string;
    usageMetadata?: CachedContentUsageMetadata;
}

// @public
export interface CachedContentUsageMetadata {
    audioDurationSeconds?: number;
    imageCount?: number;
    textCount?: number;
    totalTokenCount?: number;
    videoDurationSeconds?: number;
}

// Warning: (ae-forgotten-export) The symbol "BaseModule" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export class Caches extends BaseModule {
    // Warning: (ae-forgotten-export) The symbol "ApiClient" needs to be exported by the entry point index.d.ts
    constructor(apiClient: ApiClient);
    create(params: types.CreateCachedContentParameters): Promise<types.CachedContent>;
    delete(params: types.DeleteCachedContentParameters): Promise<types.DeleteCachedContentResponse>;
    get(params: types.GetCachedContentParameters): Promise<types.CachedContent>;
    // Warning: (ae-forgotten-export) The symbol "types" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "Pager" needs to be exported by the entry point index.d.ts
    list: (params?: types.ListCachedContentsParameters) => Promise<Pager<types.CachedContent>>;
    update(params: types.UpdateCachedContentParameters): Promise<types.CachedContent>;
}

// @public
export interface Candidate {
    avgLogprobs?: number;
    citationMetadata?: CitationMetadata;
    content?: Content;
    finishMessage?: string;
    finishReason?: FinishReason;
    groundingMetadata?: GroundingMetadata;
    index?: number;
    logprobsResult?: LogprobsResult;
    safetyRatings?: SafetyRating[];
    tokenCount?: number;
}

// @public
export class Chat {
    constructor(apiClient: ApiClient, modelsModule: Models, model: string, config?: types.GenerateContentConfig, history?: types.Content[]);
    getHistory(curated?: boolean): types.Content[];
    sendMessage(params: types.SendMessageParameters): Promise<types.GenerateContentResponse>;
    sendMessageStream(params: types.SendMessageParameters): Promise<AsyncGenerator<types.GenerateContentResponse>>;
}

// @public
export class Chats {
    constructor(modelsModule: Models, apiClient: ApiClient);
    create(params: types.CreateChatParameters): Chat;
}

// @public
export interface Citation {
    endIndex?: number;
    license?: string;
    publicationDate?: GoogleTypeDate;
    startIndex?: number;
    title?: string;
    uri?: string;
}

// @public
export interface CitationMetadata {
    citations?: Citation[];
}

// @public
export interface CodeExecutionResult {
    outcome?: Outcome;
    output?: string;
}

// @public
export interface ComputeTokensConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface ComputeTokensParameters {
    config?: ComputeTokensConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class ComputeTokensResponse {
    tokensInfo?: TokensInfo[];
}

// @public
export interface Content {
    parts?: Part[];
    role?: string;
}

// @public
export interface ContentEmbedding {
    statistics?: ContentEmbeddingStatistics;
    values?: number[];
}

// @public
export interface ContentEmbeddingStatistics {
    tokenCount?: number;
    truncated?: boolean;
}

// @public (undocumented)
export type ContentListUnion = ContentUnion[] | ContentUnion;

// @public (undocumented)
export type ContentUnion = Content | PartUnion[] | PartUnion;

// @public
export interface ControlReferenceConfig {
    controlType?: ControlReferenceType;
    enableControlImageComputation?: boolean;
}

// @public
export interface ControlReferenceImage {
    config?: ControlReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum ControlReferenceType {
    // (undocumented)
    CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY",
    // (undocumented)
    CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT",
    // (undocumented)
    CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH",
    // (undocumented)
    CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE"
}

// @public
export interface CountTokensConfig {
    generationConfig?: GenerationConfig;
    httpOptions?: HttpOptions;
    systemInstruction?: ContentUnion;
    tools?: Tool[];
}

// @public
export interface CountTokensParameters {
    config?: CountTokensConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class CountTokensResponse {
    cachedContentTokenCount?: number;
    totalTokens?: number;
}

// @public
export interface CreateCachedContentConfig {
    contents?: ContentListUnion;
    displayName?: string;
    expireTime?: string;
    httpOptions?: HttpOptions;
    systemInstruction?: ContentUnion;
    toolConfig?: ToolConfig;
    tools?: Tool[];
    ttl?: string;
}

// @public
export interface CreateCachedContentParameters {
    config?: CreateCachedContentConfig;
    model: string;
}

// @public
export interface CreateChatParameters {
    config?: GenerateContentConfig;
    history?: Content[];
    model: string;
}

// @public
export interface CreateFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface CreateFileParameters {
    config?: CreateFileConfig;
    file: File_2;
}

// @public
export class CreateFileResponse {
    sdkHttpResponse?: HttpResponse;
}

// @public
export function createModelContent(partOrString: PartListUnion | string): Content;

// @public
export function createPartFromBase64(data: string, mimeType: string): Part;

// @public
export function createPartFromCodeExecutionResult(outcome: Outcome, output: string): Part;

// @public
export function createPartFromExecutableCode(code: string, language: Language): Part;

// @public
export function createPartFromFunctionCall(name: string, args: Record<string, unknown>): Part;

// @public
export function createPartFromFunctionResponse(id: string, name: string, response: Record<string, unknown>): Part;

// @public
export function createPartFromText(text: string): Part;

// @public
export function createPartFromUri(uri: string, mimeType: string): Part;

// @public
export function createUserContent(partOrString: PartListUnion | string): Content;

// @public
export interface DeleteCachedContentConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface DeleteCachedContentParameters {
    config?: DeleteCachedContentConfig;
    name: string;
}

// @public
export class DeleteCachedContentResponse {
}

// @public
export interface DownloadFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface DynamicRetrievalConfig {
    dynamicThreshold?: number;
    mode?: DynamicRetrievalConfigMode;
}

// @public (undocumented)
export enum DynamicRetrievalConfigMode {
    // (undocumented)
    MODE_DYNAMIC = "MODE_DYNAMIC",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED"
}

// @public (undocumented)
export interface EmbedContentConfig {
    autoTruncate?: boolean;
    httpOptions?: HttpOptions;
    mimeType?: string;
    outputDimensionality?: number;
    taskType?: string;
    title?: string;
}

// @public
export interface EmbedContentMetadata {
    billableCharacterCount?: number;
}

// @public
export interface EmbedContentParameters {
    config?: EmbedContentConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class EmbedContentResponse {
    embeddings?: ContentEmbedding[];
    metadata?: EmbedContentMetadata;
}

// @public
export interface ExecutableCode {
    code?: string;
    language?: Language;
}

// @public
interface File_2 {
    createTime?: string;
    displayName?: string;
    downloadUri?: string;
    error?: FileStatus;
    expirationTime?: string;
    mimeType?: string;
    name?: string;
    sha256Hash?: string;
    sizeBytes?: number;
    source?: FileSource;
    state?: FileState;
    updateTime?: string;
    uri?: string;
    videoMetadata?: Record<string, unknown>;
}
export { File_2 as File }

// @public
export interface FileData {
    fileUri?: string;
    mimeType?: string;
}

// @public (undocumented)
export enum FileSource {
    // (undocumented)
    GENERATED = "GENERATED",
    // (undocumented)
    SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED",
    // (undocumented)
    UPLOADED = "UPLOADED"
}

// @public (undocumented)
export enum FileState {
    // (undocumented)
    ACTIVE = "ACTIVE",
    // (undocumented)
    FAILED = "FAILED",
    // (undocumented)
    PROCESSING = "PROCESSING",
    // (undocumented)
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED"
}

// @public
export interface FileStatus {
    code?: number;
    details?: Record<string, unknown>[];
    message?: string;
}

// @public (undocumented)
export enum FinishReason {
    // (undocumented)
    BLOCKLIST = "BLOCKLIST",
    // (undocumented)
    FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED",
    // (undocumented)
    IMAGE_SAFETY = "IMAGE_SAFETY",
    // (undocumented)
    MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL",
    // (undocumented)
    MAX_TOKENS = "MAX_TOKENS",
    // (undocumented)
    OTHER = "OTHER",
    // (undocumented)
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT",
    // (undocumented)
    RECITATION = "RECITATION",
    // (undocumented)
    SAFETY = "SAFETY",
    // (undocumented)
    SPII = "SPII",
    // (undocumented)
    STOP = "STOP"
}

// @public
export interface FunctionCall {
    args?: Record<string, unknown>;
    id?: string;
    name?: string;
}

// @public
export interface FunctionCallingConfig {
    allowedFunctionNames?: string[];
    mode?: FunctionCallingConfigMode;
}

// @public (undocumented)
export enum FunctionCallingConfigMode {
    // (undocumented)
    ANY = "ANY",
    // (undocumented)
    AUTO = "AUTO",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED",
    // (undocumented)
    NONE = "NONE"
}

// @public
export interface FunctionDeclaration {
    description?: string;
    name?: string;
    parameters?: Schema;
    response?: Schema;
}

// @public
export class FunctionResponse {
    id?: string;
    name?: string;
    response?: Record<string, unknown>;
}

// @public
export interface GenerateContentConfig {
    audioTimestamp?: boolean;
    cachedContent?: string;
    candidateCount?: number;
    frequencyPenalty?: number;
    httpOptions?: HttpOptions;
    labels?: Record<string, string>;
    logprobs?: number;
    maxOutputTokens?: number;
    mediaResolution?: MediaResolution;
    presencePenalty?: number;
    responseLogprobs?: boolean;
    responseMimeType?: string;
    responseModalities?: string[];
    responseSchema?: SchemaUnion;
    routingConfig?: GenerationConfigRoutingConfig;
    safetySettings?: SafetySetting[];
    seed?: number;
    speechConfig?: SpeechConfigUnion;
    stopSequences?: string[];
    systemInstruction?: ContentUnion;
    temperature?: number;
    thinkingConfig?: ThinkingConfig;
    toolConfig?: ToolConfig;
    tools?: ToolListUnion;
    topK?: number;
    topP?: number;
}

// @public
export interface GenerateContentParameters {
    config?: GenerateContentConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class GenerateContentResponse {
    candidates?: Candidate[];
    get codeExecutionResult(): string | undefined;
    createTime?: string;
    get executableCode(): string | undefined;
    get functionCalls(): FunctionCall[] | undefined;
    modelVersion?: string;
    promptFeedback?: GenerateContentResponsePromptFeedback;
    responseId?: string;
    get text(): string | undefined;
    usageMetadata?: GenerateContentResponseUsageMetadata;
}

// @public
export class GenerateContentResponsePromptFeedback {
    blockReason?: BlockedReason;
    blockReasonMessage?: string;
    safetyRatings?: SafetyRating[];
}

// @public
export class GenerateContentResponseUsageMetadata {
    cachedContentTokenCount?: number;
    cacheTokensDetails?: ModalityTokenCount[];
    candidatesTokenCount?: number;
    candidatesTokensDetails?: ModalityTokenCount[];
    promptTokenCount?: number;
    promptTokensDetails?: ModalityTokenCount[];
    thoughtsTokenCount?: number;
    toolUsePromptTokenCount?: number;
    toolUsePromptTokensDetails?: ModalityTokenCount[];
    totalTokenCount?: number;
}

// @public
export interface GeneratedImage {
    enhancedPrompt?: string;
    image?: Image_2;
    raiFilteredReason?: string;
    safetyAttributes?: SafetyAttributes;
}

// @public
export interface GenerateImagesConfig {
    addWatermark?: boolean;
    aspectRatio?: string;
    enhancePrompt?: boolean;
    guidanceScale?: number;
    httpOptions?: HttpOptions;
    includeRaiReason?: boolean;
    includeSafetyAttributes?: boolean;
    language?: ImagePromptLanguage;
    negativePrompt?: string;
    numberOfImages?: number;
    outputCompressionQuality?: number;
    outputGcsUri?: string;
    outputMimeType?: string;
    personGeneration?: PersonGeneration;
    safetyFilterLevel?: SafetyFilterLevel;
    seed?: number;
}

// @public
export interface GenerateImagesParameters {
    config?: GenerateImagesConfig;
    model: string;
    prompt: string;
}

// @public
export class GenerateImagesResponse {
    generatedImages?: GeneratedImage[];
    positivePromptSafetyAttributes?: SafetyAttributes;
}

// @public
export interface GenerationConfig {
    audioTimestamp?: boolean;
    candidateCount?: number;
    frequencyPenalty?: number;
    logprobs?: number;
    maxOutputTokens?: number;
    presencePenalty?: number;
    responseLogprobs?: boolean;
    responseMimeType?: string;
    responseSchema?: Schema;
    routingConfig?: GenerationConfigRoutingConfig;
    seed?: number;
    stopSequences?: string[];
    temperature?: number;
    topK?: number;
    topP?: number;
}

// @public
export interface GenerationConfigRoutingConfig {
    autoMode?: GenerationConfigRoutingConfigAutoRoutingMode;
    manualMode?: GenerationConfigRoutingConfigManualRoutingMode;
}

// @public
export interface GenerationConfigRoutingConfigAutoRoutingMode {
    modelRoutingPreference?: 'UNKNOWN' | 'PRIORITIZE_QUALITY' | 'BALANCED' | 'PRIORITIZE_COST';
}

// @public
export interface GenerationConfigRoutingConfigManualRoutingMode {
    modelName?: string;
}

// @public
export interface GetCachedContentConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface GetCachedContentParameters {
    config?: GetCachedContentConfig;
    name: string;
}

// @public
export interface GetFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface GetFileParameters {
    config?: GetFileConfig;
    name: string;
}

// @public
export class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    // (undocumented)
    protected readonly apiClient: ApiClient;
    // (undocumented)
    readonly caches: Caches;
    // (undocumented)
    readonly chats: Chats;
    // Warning: (ae-forgotten-export) The symbol "Files" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly files: Files;
    // (undocumented)
    readonly live: Live;
    // (undocumented)
    readonly models: Models;
    // (undocumented)
    readonly vertexai: boolean;
}

// @public
export interface GoogleGenAIOptions {
    apiKey?: string;
    apiVersion?: string;
    googleAuthOptions?: GoogleAuthOptions;
    httpOptions?: HttpOptions;
    location?: string;
    project?: string;
    vertexai?: boolean;
}

// @public
export interface GoogleSearch {
}

// @public
export interface GoogleSearchRetrieval {
    dynamicRetrievalConfig?: DynamicRetrievalConfig;
}

// @public
export interface GoogleTypeDate {
    day?: number;
    month?: number;
    year?: number;
}

// @public
export interface GroundingChunk {
    retrievedContext?: GroundingChunkRetrievedContext;
    web?: GroundingChunkWeb;
}

// @public
export interface GroundingChunkRetrievedContext {
    text?: string;
    title?: string;
    uri?: string;
}

// @public
export interface GroundingChunkWeb {
    title?: string;
    uri?: string;
}

// @public
export interface GroundingMetadata {
    groundingChunks?: GroundingChunk[];
    groundingSupports?: GroundingSupport[];
    retrievalMetadata?: RetrievalMetadata;
    retrievalQueries?: string[];
    searchEntryPoint?: SearchEntryPoint;
    webSearchQueries?: string[];
}

// @public
export interface GroundingSupport {
    confidenceScores?: number[];
    groundingChunkIndices?: number[];
    segment?: Segment;
}

// @public (undocumented)
export enum HarmBlockMethod {
    // (undocumented)
    HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED",
    // (undocumented)
    PROBABILITY = "PROBABILITY",
    // (undocumented)
    SEVERITY = "SEVERITY"
}

// @public (undocumented)
export enum HarmBlockThreshold {
    // (undocumented)
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    // (undocumented)
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    // (undocumented)
    BLOCK_NONE = "BLOCK_NONE",
    // (undocumented)
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
    // (undocumented)
    HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
    // (undocumented)
    OFF = "OFF"
}

// @public (undocumented)
export enum HarmCategory {
    // (undocumented)
    HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY",
    // (undocumented)
    HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT",
    // (undocumented)
    HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT",
    // (undocumented)
    HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH",
    // (undocumented)
    HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    // (undocumented)
    HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED"
}

// @public (undocumented)
export enum HarmProbability {
    // (undocumented)
    HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED",
    // (undocumented)
    HIGH = "HIGH",
    // (undocumented)
    LOW = "LOW",
    // (undocumented)
    MEDIUM = "MEDIUM",
    // (undocumented)
    NEGLIGIBLE = "NEGLIGIBLE"
}

// @public (undocumented)
export enum HarmSeverity {
    // (undocumented)
    HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH",
    // (undocumented)
    HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW",
    // (undocumented)
    HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM",
    // (undocumented)
    HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE",
    // (undocumented)
    HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED"
}

// @public
export interface HttpOptions {
    apiVersion?: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
}

// @public
export class HttpResponse {
    constructor(response: Response);
    headers?: Record<string, string>;
    // (undocumented)
    json(): Promise<unknown>;
    responseInternal: Response;
}

// @public
interface Image_2 {
    gcsUri?: string;
    imageBytes?: string;
    mimeType?: string;
}
export { Image_2 as Image }

// @public (undocumented)
export enum ImagePromptLanguage {
    // (undocumented)
    auto = "auto",
    // (undocumented)
    en = "en",
    // (undocumented)
    hi = "hi",
    // (undocumented)
    ja = "ja",
    // (undocumented)
    ko = "ko"
}

// @public (undocumented)
export enum Language {
    // (undocumented)
    LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED",
    // (undocumented)
    PYTHON = "PYTHON"
}

// @public
export interface ListCachedContentsConfig {
    httpOptions?: HttpOptions;
    // (undocumented)
    pageSize?: number;
    // (undocumented)
    pageToken?: string;
}

// @public
export interface ListCachedContentsParameters {
    config?: ListCachedContentsConfig;
}

// @public (undocumented)
export class ListCachedContentsResponse {
    cachedContents?: CachedContent[];
    // (undocumented)
    nextPageToken?: string;
}

// @public
export interface ListFilesConfig {
    httpOptions?: HttpOptions;
    // (undocumented)
    pageSize?: number;
    // (undocumented)
    pageToken?: string;
}

// @public
export interface ListFilesParameters {
    config?: ListFilesConfig;
}

// @public
export class ListFilesResponse {
    files?: File_2[];
    nextPageToken?: string;
}

// @public
export class Live {
    // Warning: (ae-forgotten-export) The symbol "Auth" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "WebSocketFactory" needs to be exported by the entry point index.d.ts
    constructor(apiClient: ApiClient, auth: Auth, webSocketFactory: WebSocketFactory);
    connect(params: types.LiveConnectParameters): Promise<Session>;
}

// @public
export interface LiveCallbacks {
    // (undocumented)
    onclose?: ((e: CloseEvent) => void) | null;
    // (undocumented)
    onerror?: ((e: ErrorEvent) => void) | null;
    // (undocumented)
    onmessage: (e: LiveServerMessage) => void;
    // (undocumented)
    onopen?: (() => void) | null;
}

// @public
export interface LiveClientContent {
    turnComplete?: boolean;
    turns?: Content[];
}

// @public
export interface LiveClientMessage {
    clientContent?: LiveClientContent;
    realtimeInput?: LiveClientRealtimeInput;
    setup?: LiveClientSetup;
    toolResponse?: LiveClientToolResponse;
}

// @public
export interface LiveClientRealtimeInput {
    mediaChunks?: Blob_2[];
}

// @public
export interface LiveClientSetup {
    generationConfig?: GenerationConfig;
    model?: string;
    systemInstruction?: Content;
    tools?: ToolListUnion;
}

// @public
export class LiveClientToolResponse {
    functionResponses?: FunctionResponse[];
}

// @public
export interface LiveConnectConfig {
    generationConfig?: GenerationConfig;
    responseModalities?: Modality[];
    speechConfig?: SpeechConfig;
    systemInstruction?: Content;
    tools?: ToolListUnion;
}

// @public
export interface LiveConnectParameters {
    callbacks: LiveCallbacks;
    config?: LiveConnectConfig;
    model: string;
}

// @public
export interface LiveSendClientContentParameters {
    turnComplete?: boolean;
    turns?: ContentListUnion;
}

// @public
export interface LiveSendRealtimeInputParameters {
    media: Blob_2;
}

// @public
export class LiveSendToolResponseParameters {
    functionResponses: FunctionResponse[] | FunctionResponse;
}

// @public
export interface LiveServerContent {
    interrupted?: boolean;
    modelTurn?: Content;
    turnComplete?: boolean;
}

// @public
export interface LiveServerMessage {
    serverContent?: LiveServerContent;
    setupComplete?: LiveServerSetupComplete;
    toolCall?: LiveServerToolCall;
    toolCallCancellation?: LiveServerToolCallCancellation;
}

// @public
export interface LiveServerSetupComplete {
}

// @public
export interface LiveServerToolCall {
    functionCalls?: FunctionCall[];
}

// @public
export interface LiveServerToolCallCancellation {
    ids?: string[];
}

// @public
export interface LogprobsResult {
    chosenCandidates?: LogprobsResultCandidate[];
    topCandidates?: LogprobsResultTopCandidates[];
}

// @public
export interface LogprobsResultCandidate {
    logProbability?: number;
    token?: string;
    tokenId?: number;
}

// @public
export interface LogprobsResultTopCandidates {
    candidates?: LogprobsResultCandidate[];
}

// @public
export interface MaskReferenceConfig {
    maskDilation?: number;
    maskMode?: MaskReferenceMode;
    segmentationClasses?: number[];
}

// @public
export interface MaskReferenceImage {
    config?: MaskReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum MaskReferenceMode {
    // (undocumented)
    MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND",
    // (undocumented)
    MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT",
    // (undocumented)
    MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND",
    // (undocumented)
    MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC",
    // (undocumented)
    MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED"
}

// @public (undocumented)
export enum MediaResolution {
    // (undocumented)
    MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH",
    // (undocumented)
    MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW",
    // (undocumented)
    MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM",
    // (undocumented)
    MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED"
}

// @public (undocumented)
export enum Modality {
    // (undocumented)
    AUDIO = "AUDIO",
    // (undocumented)
    IMAGE = "IMAGE",
    // (undocumented)
    MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED",
    // (undocumented)
    TEXT = "TEXT"
}

// @public
export interface ModalityTokenCount {
    modality?: Modality;
    tokenCount?: number;
}

// @public (undocumented)
export enum Mode {
    // (undocumented)
    MODE_DYNAMIC = "MODE_DYNAMIC",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED"
}

// @public (undocumented)
export class Models extends BaseModule {
    constructor(apiClient: ApiClient);
    computeTokens(params: types.ComputeTokensParameters): Promise<types.ComputeTokensResponse>;
    countTokens(params: types.CountTokensParameters): Promise<types.CountTokensResponse>;
    embedContent(params: types.EmbedContentParameters): Promise<types.EmbedContentResponse>;
    generateContent: (params: types.GenerateContentParameters) => Promise<types.GenerateContentResponse>;
    generateContentStream: (params: types.GenerateContentParameters) => Promise<AsyncGenerator<types.GenerateContentResponse>>;
    generateImages: (params: types.GenerateImagesParameters) => Promise<types.GenerateImagesResponse>;
}

// @public
export enum Outcome {
    // (undocumented)
    OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED",
    // (undocumented)
    OUTCOME_FAILED = "OUTCOME_FAILED",
    // (undocumented)
    OUTCOME_OK = "OUTCOME_OK",
    // (undocumented)
    OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED"
}

// @public
export interface Part {
    codeExecutionResult?: CodeExecutionResult;
    executableCode?: ExecutableCode;
    fileData?: FileData;
    functionCall?: FunctionCall;
    functionResponse?: FunctionResponse;
    inlineData?: Blob_2;
    text?: string;
    thought?: boolean;
    videoMetadata?: VideoMetadata;
}

// @public (undocumented)
export type PartListUnion = PartUnion[] | PartUnion;

// @public (undocumented)
export type PartUnion = Part | string;

// @public (undocumented)
export enum PersonGeneration {
    // (undocumented)
    ALLOW_ADULT = "ALLOW_ADULT",
    // (undocumented)
    ALLOW_ALL = "ALLOW_ALL",
    // (undocumented)
    DONT_ALLOW = "DONT_ALLOW"
}

// @public
export interface PrebuiltVoiceConfig {
    voiceName?: string;
}

// @public
export interface RawReferenceImage {
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public
export interface ReplayFile {
    // (undocumented)
    interactions?: ReplayInteraction[];
    // (undocumented)
    replayId?: string;
}

// @public
export interface ReplayInteraction {
    // (undocumented)
    request?: ReplayRequest;
    // (undocumented)
    response?: ReplayResponse;
}

// @public
export interface ReplayRequest {
    // (undocumented)
    bodySegments?: Record<string, unknown>[];
    // (undocumented)
    headers?: Record<string, string>;
    // (undocumented)
    method?: string;
    // (undocumented)
    url?: string;
}

// @public
export class ReplayResponse {
    // (undocumented)
    bodySegments?: Record<string, unknown>[];
    // (undocumented)
    headers?: Record<string, string>;
    // (undocumented)
    sdkResponseSegments?: Record<string, unknown>[];
    // (undocumented)
    statusCode?: number;
}

// @public
export interface Retrieval {
    disableAttribution?: boolean;
    vertexAiSearch?: VertexAISearch;
    vertexRagStore?: VertexRagStore;
}

// @public
export interface RetrievalMetadata {
    googleSearchDynamicRetrievalScore?: number;
}

// @public
export interface SafetyAttributes {
    categories?: string[];
    contentType?: string;
    scores?: number[];
}

// @public (undocumented)
export enum SafetyFilterLevel {
    // (undocumented)
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    // (undocumented)
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    // (undocumented)
    BLOCK_NONE = "BLOCK_NONE",
    // (undocumented)
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH"
}

// @public
export interface SafetyRating {
    blocked?: boolean;
    category?: HarmCategory;
    probability?: HarmProbability;
    probabilityScore?: number;
    severity?: HarmSeverity;
    severityScore?: number;
}

// @public
export interface SafetySetting {
    category?: HarmCategory;
    method?: HarmBlockMethod;
    threshold?: HarmBlockThreshold;
}

// @public
export interface Schema {
    anyOf?: Schema[];
    default?: unknown;
    description?: string;
    enum?: string[];
    example?: unknown;
    format?: string;
    items?: Schema;
    maximum?: number;
    maxItems?: string;
    maxLength?: string;
    maxProperties?: string;
    minimum?: number;
    minItems?: string;
    minLength?: string;
    minProperties?: string;
    nullable?: boolean;
    pattern?: string;
    properties?: Record<string, Schema>;
    propertyOrdering?: string[];
    required?: string[];
    title?: string;
    type?: Type;
}

// @public (undocumented)
export type SchemaUnion = Schema;

// @public
export interface SearchEntryPoint {
    renderedContent?: string;
    sdkBlob?: string;
}

// @public
export interface Segment {
    endIndex?: number;
    partIndex?: number;
    startIndex?: number;
    text?: string;
}

// @public
export interface SendMessageParameters {
    config?: GenerateContentConfig;
    message: PartListUnion;
}

// @public
export class Session {
    constructor(conn: WebSocket_2, apiClient: ApiClient);
    close(): void;
    // Warning: (ae-forgotten-export) The symbol "WebSocket_2" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly conn: WebSocket_2;
    sendClientContent(params: types.LiveSendClientContentParameters): void;
    sendRealtimeInput(params: types.LiveSendRealtimeInputParameters): void;
    sendToolResponse(params: types.LiveSendToolResponseParameters): void;
}

// @public
export interface SpeechConfig {
    voiceConfig?: VoiceConfig;
}

// @public (undocumented)
export type SpeechConfigUnion = SpeechConfig | string;

// @public (undocumented)
export enum State {
    // (undocumented)
    ACTIVE = "ACTIVE",
    // (undocumented)
    ERROR = "ERROR",
    // (undocumented)
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED"
}

// @public
export interface StyleReferenceConfig {
    styleDescription?: string;
}

// @public
export interface StyleReferenceImage {
    config?: StyleReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public
export interface SubjectReferenceConfig {
    subjectDescription?: string;
    subjectType?: SubjectReferenceType;
}

// @public
export interface SubjectReferenceImage {
    config?: SubjectReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum SubjectReferenceType {
    // (undocumented)
    SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL",
    // (undocumented)
    SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT",
    // (undocumented)
    SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON",
    // (undocumented)
    SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT"
}

// @public (undocumented)
export interface TestTableFile {
    // (undocumented)
    comment?: string;
    // (undocumented)
    parameterNames?: string[];
    // (undocumented)
    testMethod?: string;
    // (undocumented)
    testTable?: TestTableItem[];
}

// @public (undocumented)
export interface TestTableItem {
    exceptionIfMldev?: string;
    exceptionIfVertex?: string;
    hasUnion?: boolean;
    ignoreKeys?: string[];
    name?: string;
    overrideReplayId?: string;
    parameters?: Record<string, unknown>;
    skipInApiMode?: string;
}

// @public
export interface ThinkingConfig {
    includeThoughts?: boolean;
}

// @public
export interface TokensInfo {
    role?: string;
    tokenIds?: string[];
    tokens?: string[];
}

// @public
export interface Tool {
    codeExecution?: ToolCodeExecution;
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: GoogleSearch;
    googleSearchRetrieval?: GoogleSearchRetrieval;
    retrieval?: Retrieval;
}

// @public
export interface ToolCodeExecution {
}

// @public
export interface ToolConfig {
    functionCallingConfig?: FunctionCallingConfig;
}

// @public (undocumented)
export type ToolListUnion = Tool[];

// @public (undocumented)
export enum Type {
    // (undocumented)
    ARRAY = "ARRAY",
    // (undocumented)
    BOOLEAN = "BOOLEAN",
    // (undocumented)
    INTEGER = "INTEGER",
    // (undocumented)
    NUMBER = "NUMBER",
    // (undocumented)
    OBJECT = "OBJECT",
    // (undocumented)
    STRING = "STRING",
    // (undocumented)
    TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED"
}

// @public
export interface UpdateCachedContentConfig {
    expireTime?: string;
    httpOptions?: HttpOptions;
    ttl?: string;
}

// @public (undocumented)
export interface UpdateCachedContentParameters {
    config?: UpdateCachedContentConfig;
    name: string;
}

// @public
export interface UploadFileConfig {
    displayName?: string;
    httpOptions?: HttpOptions;
    mimeType?: string;
    name?: string;
}

// @public
export interface UpscaleImageConfig {
    httpOptions?: HttpOptions;
    includeRaiReason?: boolean;
    outputCompressionQuality?: number;
    outputMimeType?: string;
}

// @public
export interface UpscaleImageParameters {
    config?: UpscaleImageConfig;
    image: Image_2;
    model: string;
    upscaleFactor: string;
}

// @public
export interface VertexAISearch {
    datastore?: string;
}

// @public
export interface VertexRagStore {
    ragCorpora?: string[];
    ragResources?: VertexRagStoreRagResource[];
    similarityTopK?: number;
    vectorDistanceThreshold?: number;
}

// @public
export interface VertexRagStoreRagResource {
    ragCorpus?: string;
    ragFileIds?: string[];
}

// @public
export interface VideoMetadata {
    endOffset?: string;
    startOffset?: string;
}

// @public
export interface VoiceConfig {
    prebuiltVoiceConfig?: PrebuiltVoiceConfig;
}

// (No @packageDocumentation comment for this package)

```



================================================
File: api-report/genai.api.md
================================================
## API Report File for "@google/genai"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { GoogleAuthOptions } from 'google-auth-library';

// @public
interface Blob_2 {
    data?: string;
    mimeType?: string;
}
export { Blob_2 as Blob }

// @public (undocumented)
export enum BlockedReason {
    // (undocumented)
    BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED",
    // (undocumented)
    BLOCKLIST = "BLOCKLIST",
    // (undocumented)
    OTHER = "OTHER",
    // (undocumented)
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT",
    // (undocumented)
    SAFETY = "SAFETY"
}

// @public
export interface CachedContent {
    createTime?: string;
    displayName?: string;
    expireTime?: string;
    model?: string;
    name?: string;
    updateTime?: string;
    usageMetadata?: CachedContentUsageMetadata;
}

// @public
export interface CachedContentUsageMetadata {
    audioDurationSeconds?: number;
    imageCount?: number;
    textCount?: number;
    totalTokenCount?: number;
    videoDurationSeconds?: number;
}

// Warning: (ae-forgotten-export) The symbol "BaseModule" needs to be exported by the entry point index.d.ts
//
// @public (undocumented)
export class Caches extends BaseModule {
    // Warning: (ae-forgotten-export) The symbol "ApiClient" needs to be exported by the entry point index.d.ts
    constructor(apiClient: ApiClient);
    create(params: types.CreateCachedContentParameters): Promise<types.CachedContent>;
    delete(params: types.DeleteCachedContentParameters): Promise<types.DeleteCachedContentResponse>;
    get(params: types.GetCachedContentParameters): Promise<types.CachedContent>;
    // Warning: (ae-forgotten-export) The symbol "types" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "Pager" needs to be exported by the entry point index.d.ts
    list: (params?: types.ListCachedContentsParameters) => Promise<Pager<types.CachedContent>>;
    update(params: types.UpdateCachedContentParameters): Promise<types.CachedContent>;
}

// @public
export interface Candidate {
    avgLogprobs?: number;
    citationMetadata?: CitationMetadata;
    content?: Content;
    finishMessage?: string;
    finishReason?: FinishReason;
    groundingMetadata?: GroundingMetadata;
    index?: number;
    logprobsResult?: LogprobsResult;
    safetyRatings?: SafetyRating[];
    tokenCount?: number;
}

// @public
export class Chat {
    constructor(apiClient: ApiClient, modelsModule: Models, model: string, config?: types.GenerateContentConfig, history?: types.Content[]);
    getHistory(curated?: boolean): types.Content[];
    sendMessage(params: types.SendMessageParameters): Promise<types.GenerateContentResponse>;
    sendMessageStream(params: types.SendMessageParameters): Promise<AsyncGenerator<types.GenerateContentResponse>>;
}

// @public
export class Chats {
    constructor(modelsModule: Models, apiClient: ApiClient);
    create(params: types.CreateChatParameters): Chat;
}

// @public
export interface Citation {
    endIndex?: number;
    license?: string;
    publicationDate?: GoogleTypeDate;
    startIndex?: number;
    title?: string;
    uri?: string;
}

// @public
export interface CitationMetadata {
    citations?: Citation[];
}

// @public
export interface CodeExecutionResult {
    outcome?: Outcome;
    output?: string;
}

// @public
export interface ComputeTokensConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface ComputeTokensParameters {
    config?: ComputeTokensConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class ComputeTokensResponse {
    tokensInfo?: TokensInfo[];
}

// @public
export interface Content {
    parts?: Part[];
    role?: string;
}

// @public
export interface ContentEmbedding {
    statistics?: ContentEmbeddingStatistics;
    values?: number[];
}

// @public
export interface ContentEmbeddingStatistics {
    tokenCount?: number;
    truncated?: boolean;
}

// @public (undocumented)
export type ContentListUnion = ContentUnion[] | ContentUnion;

// @public (undocumented)
export type ContentUnion = Content | PartUnion[] | PartUnion;

// @public
export interface ControlReferenceConfig {
    controlType?: ControlReferenceType;
    enableControlImageComputation?: boolean;
}

// @public
export interface ControlReferenceImage {
    config?: ControlReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum ControlReferenceType {
    // (undocumented)
    CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY",
    // (undocumented)
    CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT",
    // (undocumented)
    CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH",
    // (undocumented)
    CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE"
}

// @public
export interface CountTokensConfig {
    generationConfig?: GenerationConfig;
    httpOptions?: HttpOptions;
    systemInstruction?: ContentUnion;
    tools?: Tool[];
}

// @public
export interface CountTokensParameters {
    config?: CountTokensConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class CountTokensResponse {
    cachedContentTokenCount?: number;
    totalTokens?: number;
}

// @public
export interface CreateCachedContentConfig {
    contents?: ContentListUnion;
    displayName?: string;
    expireTime?: string;
    httpOptions?: HttpOptions;
    systemInstruction?: ContentUnion;
    toolConfig?: ToolConfig;
    tools?: Tool[];
    ttl?: string;
}

// @public
export interface CreateCachedContentParameters {
    config?: CreateCachedContentConfig;
    model: string;
}

// @public
export interface CreateChatParameters {
    config?: GenerateContentConfig;
    history?: Content[];
    model: string;
}

// @public
export interface CreateFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface CreateFileParameters {
    config?: CreateFileConfig;
    file: File_2;
}

// @public
export class CreateFileResponse {
    sdkHttpResponse?: HttpResponse;
}

// @public
export function createModelContent(partOrString: PartListUnion | string): Content;

// @public
export function createPartFromBase64(data: string, mimeType: string): Part;

// @public
export function createPartFromCodeExecutionResult(outcome: Outcome, output: string): Part;

// @public
export function createPartFromExecutableCode(code: string, language: Language): Part;

// @public
export function createPartFromFunctionCall(name: string, args: Record<string, unknown>): Part;

// @public
export function createPartFromFunctionResponse(id: string, name: string, response: Record<string, unknown>): Part;

// @public
export function createPartFromText(text: string): Part;

// @public
export function createPartFromUri(uri: string, mimeType: string): Part;

// @public
export function createUserContent(partOrString: PartListUnion | string): Content;

// @public
export interface DeleteCachedContentConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface DeleteCachedContentParameters {
    config?: DeleteCachedContentConfig;
    name: string;
}

// @public
export class DeleteCachedContentResponse {
}

// @public
export interface DownloadFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface DynamicRetrievalConfig {
    dynamicThreshold?: number;
    mode?: DynamicRetrievalConfigMode;
}

// @public (undocumented)
export enum DynamicRetrievalConfigMode {
    // (undocumented)
    MODE_DYNAMIC = "MODE_DYNAMIC",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED"
}

// @public (undocumented)
export interface EmbedContentConfig {
    autoTruncate?: boolean;
    httpOptions?: HttpOptions;
    mimeType?: string;
    outputDimensionality?: number;
    taskType?: string;
    title?: string;
}

// @public
export interface EmbedContentMetadata {
    billableCharacterCount?: number;
}

// @public
export interface EmbedContentParameters {
    config?: EmbedContentConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class EmbedContentResponse {
    embeddings?: ContentEmbedding[];
    metadata?: EmbedContentMetadata;
}

// @public
export interface ExecutableCode {
    code?: string;
    language?: Language;
}

// @public
interface File_2 {
    createTime?: string;
    displayName?: string;
    downloadUri?: string;
    error?: FileStatus;
    expirationTime?: string;
    mimeType?: string;
    name?: string;
    sha256Hash?: string;
    sizeBytes?: number;
    source?: FileSource;
    state?: FileState;
    updateTime?: string;
    uri?: string;
    videoMetadata?: Record<string, unknown>;
}
export { File_2 as File }

// @public
export interface FileData {
    fileUri?: string;
    mimeType?: string;
}

// @public (undocumented)
export enum FileSource {
    // (undocumented)
    GENERATED = "GENERATED",
    // (undocumented)
    SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED",
    // (undocumented)
    UPLOADED = "UPLOADED"
}

// @public (undocumented)
export enum FileState {
    // (undocumented)
    ACTIVE = "ACTIVE",
    // (undocumented)
    FAILED = "FAILED",
    // (undocumented)
    PROCESSING = "PROCESSING",
    // (undocumented)
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED"
}

// @public
export interface FileStatus {
    code?: number;
    details?: Record<string, unknown>[];
    message?: string;
}

// @public (undocumented)
export enum FinishReason {
    // (undocumented)
    BLOCKLIST = "BLOCKLIST",
    // (undocumented)
    FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED",
    // (undocumented)
    IMAGE_SAFETY = "IMAGE_SAFETY",
    // (undocumented)
    MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL",
    // (undocumented)
    MAX_TOKENS = "MAX_TOKENS",
    // (undocumented)
    OTHER = "OTHER",
    // (undocumented)
    PROHIBITED_CONTENT = "PROHIBITED_CONTENT",
    // (undocumented)
    RECITATION = "RECITATION",
    // (undocumented)
    SAFETY = "SAFETY",
    // (undocumented)
    SPII = "SPII",
    // (undocumented)
    STOP = "STOP"
}

// @public
export interface FunctionCall {
    args?: Record<string, unknown>;
    id?: string;
    name?: string;
}

// @public
export interface FunctionCallingConfig {
    allowedFunctionNames?: string[];
    mode?: FunctionCallingConfigMode;
}

// @public (undocumented)
export enum FunctionCallingConfigMode {
    // (undocumented)
    ANY = "ANY",
    // (undocumented)
    AUTO = "AUTO",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED",
    // (undocumented)
    NONE = "NONE"
}

// @public
export interface FunctionDeclaration {
    description?: string;
    name?: string;
    parameters?: Schema;
    response?: Schema;
}

// @public
export class FunctionResponse {
    id?: string;
    name?: string;
    response?: Record<string, unknown>;
}

// @public
export interface GenerateContentConfig {
    audioTimestamp?: boolean;
    cachedContent?: string;
    candidateCount?: number;
    frequencyPenalty?: number;
    httpOptions?: HttpOptions;
    labels?: Record<string, string>;
    logprobs?: number;
    maxOutputTokens?: number;
    mediaResolution?: MediaResolution;
    presencePenalty?: number;
    responseLogprobs?: boolean;
    responseMimeType?: string;
    responseModalities?: string[];
    responseSchema?: SchemaUnion;
    routingConfig?: GenerationConfigRoutingConfig;
    safetySettings?: SafetySetting[];
    seed?: number;
    speechConfig?: SpeechConfigUnion;
    stopSequences?: string[];
    systemInstruction?: ContentUnion;
    temperature?: number;
    thinkingConfig?: ThinkingConfig;
    toolConfig?: ToolConfig;
    tools?: ToolListUnion;
    topK?: number;
    topP?: number;
}

// @public
export interface GenerateContentParameters {
    config?: GenerateContentConfig;
    contents: ContentListUnion;
    model: string;
}

// @public
export class GenerateContentResponse {
    candidates?: Candidate[];
    get codeExecutionResult(): string | undefined;
    createTime?: string;
    get executableCode(): string | undefined;
    get functionCalls(): FunctionCall[] | undefined;
    modelVersion?: string;
    promptFeedback?: GenerateContentResponsePromptFeedback;
    responseId?: string;
    get text(): string | undefined;
    usageMetadata?: GenerateContentResponseUsageMetadata;
}

// @public
export class GenerateContentResponsePromptFeedback {
    blockReason?: BlockedReason;
    blockReasonMessage?: string;
    safetyRatings?: SafetyRating[];
}

// @public
export class GenerateContentResponseUsageMetadata {
    cachedContentTokenCount?: number;
    cacheTokensDetails?: ModalityTokenCount[];
    candidatesTokenCount?: number;
    candidatesTokensDetails?: ModalityTokenCount[];
    promptTokenCount?: number;
    promptTokensDetails?: ModalityTokenCount[];
    thoughtsTokenCount?: number;
    toolUsePromptTokenCount?: number;
    toolUsePromptTokensDetails?: ModalityTokenCount[];
    totalTokenCount?: number;
}

// @public
export interface GeneratedImage {
    enhancedPrompt?: string;
    image?: Image_2;
    raiFilteredReason?: string;
    safetyAttributes?: SafetyAttributes;
}

// @public
export interface GenerateImagesConfig {
    addWatermark?: boolean;
    aspectRatio?: string;
    enhancePrompt?: boolean;
    guidanceScale?: number;
    httpOptions?: HttpOptions;
    includeRaiReason?: boolean;
    includeSafetyAttributes?: boolean;
    language?: ImagePromptLanguage;
    negativePrompt?: string;
    numberOfImages?: number;
    outputCompressionQuality?: number;
    outputGcsUri?: string;
    outputMimeType?: string;
    personGeneration?: PersonGeneration;
    safetyFilterLevel?: SafetyFilterLevel;
    seed?: number;
}

// @public
export interface GenerateImagesParameters {
    config?: GenerateImagesConfig;
    model: string;
    prompt: string;
}

// @public
export class GenerateImagesResponse {
    generatedImages?: GeneratedImage[];
    positivePromptSafetyAttributes?: SafetyAttributes;
}

// @public
export interface GenerationConfig {
    audioTimestamp?: boolean;
    candidateCount?: number;
    frequencyPenalty?: number;
    logprobs?: number;
    maxOutputTokens?: number;
    presencePenalty?: number;
    responseLogprobs?: boolean;
    responseMimeType?: string;
    responseSchema?: Schema;
    routingConfig?: GenerationConfigRoutingConfig;
    seed?: number;
    stopSequences?: string[];
    temperature?: number;
    topK?: number;
    topP?: number;
}

// @public
export interface GenerationConfigRoutingConfig {
    autoMode?: GenerationConfigRoutingConfigAutoRoutingMode;
    manualMode?: GenerationConfigRoutingConfigManualRoutingMode;
}

// @public
export interface GenerationConfigRoutingConfigAutoRoutingMode {
    modelRoutingPreference?: 'UNKNOWN' | 'PRIORITIZE_QUALITY' | 'BALANCED' | 'PRIORITIZE_COST';
}

// @public
export interface GenerationConfigRoutingConfigManualRoutingMode {
    modelName?: string;
}

// @public
export interface GetCachedContentConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface GetCachedContentParameters {
    config?: GetCachedContentConfig;
    name: string;
}

// @public
export interface GetFileConfig {
    httpOptions?: HttpOptions;
}

// @public
export interface GetFileParameters {
    config?: GetFileConfig;
    name: string;
}

// @public
export class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    // (undocumented)
    protected readonly apiClient: ApiClient;
    // (undocumented)
    readonly caches: Caches;
    // (undocumented)
    readonly chats: Chats;
    // Warning: (ae-forgotten-export) The symbol "Files" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly files: Files;
    // (undocumented)
    readonly live: Live;
    // (undocumented)
    readonly models: Models;
    // (undocumented)
    readonly vertexai: boolean;
}

// @public
export interface GoogleGenAIOptions {
    apiKey?: string;
    apiVersion?: string;
    googleAuthOptions?: GoogleAuthOptions;
    httpOptions?: HttpOptions;
    location?: string;
    project?: string;
    vertexai?: boolean;
}

// @public
export interface GoogleSearch {
}

// @public
export interface GoogleSearchRetrieval {
    dynamicRetrievalConfig?: DynamicRetrievalConfig;
}

// @public
export interface GoogleTypeDate {
    day?: number;
    month?: number;
    year?: number;
}

// @public
export interface GroundingChunk {
    retrievedContext?: GroundingChunkRetrievedContext;
    web?: GroundingChunkWeb;
}

// @public
export interface GroundingChunkRetrievedContext {
    text?: string;
    title?: string;
    uri?: string;
}

// @public
export interface GroundingChunkWeb {
    title?: string;
    uri?: string;
}

// @public
export interface GroundingMetadata {
    groundingChunks?: GroundingChunk[];
    groundingSupports?: GroundingSupport[];
    retrievalMetadata?: RetrievalMetadata;
    retrievalQueries?: string[];
    searchEntryPoint?: SearchEntryPoint;
    webSearchQueries?: string[];
}

// @public
export interface GroundingSupport {
    confidenceScores?: number[];
    groundingChunkIndices?: number[];
    segment?: Segment;
}

// @public (undocumented)
export enum HarmBlockMethod {
    // (undocumented)
    HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED",
    // (undocumented)
    PROBABILITY = "PROBABILITY",
    // (undocumented)
    SEVERITY = "SEVERITY"
}

// @public (undocumented)
export enum HarmBlockThreshold {
    // (undocumented)
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    // (undocumented)
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    // (undocumented)
    BLOCK_NONE = "BLOCK_NONE",
    // (undocumented)
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
    // (undocumented)
    HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
    // (undocumented)
    OFF = "OFF"
}

// @public (undocumented)
export enum HarmCategory {
    // (undocumented)
    HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY",
    // (undocumented)
    HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT",
    // (undocumented)
    HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT",
    // (undocumented)
    HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH",
    // (undocumented)
    HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    // (undocumented)
    HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED"
}

// @public (undocumented)
export enum HarmProbability {
    // (undocumented)
    HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED",
    // (undocumented)
    HIGH = "HIGH",
    // (undocumented)
    LOW = "LOW",
    // (undocumented)
    MEDIUM = "MEDIUM",
    // (undocumented)
    NEGLIGIBLE = "NEGLIGIBLE"
}

// @public (undocumented)
export enum HarmSeverity {
    // (undocumented)
    HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH",
    // (undocumented)
    HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW",
    // (undocumented)
    HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM",
    // (undocumented)
    HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE",
    // (undocumented)
    HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED"
}

// @public
export interface HttpOptions {
    apiVersion?: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
}

// @public
export class HttpResponse {
    constructor(response: Response);
    headers?: Record<string, string>;
    // (undocumented)
    json(): Promise<unknown>;
    responseInternal: Response;
}

// @public
interface Image_2 {
    gcsUri?: string;
    imageBytes?: string;
    mimeType?: string;
}
export { Image_2 as Image }

// @public (undocumented)
export enum ImagePromptLanguage {
    // (undocumented)
    auto = "auto",
    // (undocumented)
    en = "en",
    // (undocumented)
    hi = "hi",
    // (undocumented)
    ja = "ja",
    // (undocumented)
    ko = "ko"
}

// @public (undocumented)
export enum Language {
    // (undocumented)
    LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED",
    // (undocumented)
    PYTHON = "PYTHON"
}

// @public
export interface ListCachedContentsConfig {
    httpOptions?: HttpOptions;
    // (undocumented)
    pageSize?: number;
    // (undocumented)
    pageToken?: string;
}

// @public
export interface ListCachedContentsParameters {
    config?: ListCachedContentsConfig;
}

// @public (undocumented)
export class ListCachedContentsResponse {
    cachedContents?: CachedContent[];
    // (undocumented)
    nextPageToken?: string;
}

// @public
export interface ListFilesConfig {
    httpOptions?: HttpOptions;
    // (undocumented)
    pageSize?: number;
    // (undocumented)
    pageToken?: string;
}

// @public
export interface ListFilesParameters {
    config?: ListFilesConfig;
}

// @public
export class ListFilesResponse {
    files?: File_2[];
    nextPageToken?: string;
}

// @public
export class Live {
    // Warning: (ae-forgotten-export) The symbol "Auth" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "WebSocketFactory" needs to be exported by the entry point index.d.ts
    constructor(apiClient: ApiClient, auth: Auth, webSocketFactory: WebSocketFactory);
    connect(params: types.LiveConnectParameters): Promise<Session>;
}

// @public
export interface LiveCallbacks {
    // (undocumented)
    onclose?: ((e: CloseEvent) => void) | null;
    // (undocumented)
    onerror?: ((e: ErrorEvent) => void) | null;
    // (undocumented)
    onmessage: (e: LiveServerMessage) => void;
    // (undocumented)
    onopen?: (() => void) | null;
}

// @public
export interface LiveClientContent {
    turnComplete?: boolean;
    turns?: Content[];
}

// @public
export interface LiveClientMessage {
    clientContent?: LiveClientContent;
    realtimeInput?: LiveClientRealtimeInput;
    setup?: LiveClientSetup;
    toolResponse?: LiveClientToolResponse;
}

// @public
export interface LiveClientRealtimeInput {
    mediaChunks?: Blob_2[];
}

// @public
export interface LiveClientSetup {
    generationConfig?: GenerationConfig;
    model?: string;
    systemInstruction?: Content;
    tools?: ToolListUnion;
}

// @public
export class LiveClientToolResponse {
    functionResponses?: FunctionResponse[];
}

// @public
export interface LiveConnectConfig {
    generationConfig?: GenerationConfig;
    responseModalities?: Modality[];
    speechConfig?: SpeechConfig;
    systemInstruction?: Content;
    tools?: ToolListUnion;
}

// @public
export interface LiveConnectParameters {
    callbacks: LiveCallbacks;
    config?: LiveConnectConfig;
    model: string;
}

// @public
export interface LiveSendClientContentParameters {
    turnComplete?: boolean;
    turns?: ContentListUnion;
}

// @public
export interface LiveSendRealtimeInputParameters {
    media: Blob_2;
}

// @public
export class LiveSendToolResponseParameters {
    functionResponses: FunctionResponse[] | FunctionResponse;
}

// @public
export interface LiveServerContent {
    interrupted?: boolean;
    modelTurn?: Content;
    turnComplete?: boolean;
}

// @public
export interface LiveServerMessage {
    serverContent?: LiveServerContent;
    setupComplete?: LiveServerSetupComplete;
    toolCall?: LiveServerToolCall;
    toolCallCancellation?: LiveServerToolCallCancellation;
}

// @public
export interface LiveServerSetupComplete {
}

// @public
export interface LiveServerToolCall {
    functionCalls?: FunctionCall[];
}

// @public
export interface LiveServerToolCallCancellation {
    ids?: string[];
}

// @public
export interface LogprobsResult {
    chosenCandidates?: LogprobsResultCandidate[];
    topCandidates?: LogprobsResultTopCandidates[];
}

// @public
export interface LogprobsResultCandidate {
    logProbability?: number;
    token?: string;
    tokenId?: number;
}

// @public
export interface LogprobsResultTopCandidates {
    candidates?: LogprobsResultCandidate[];
}

// @public
export interface MaskReferenceConfig {
    maskDilation?: number;
    maskMode?: MaskReferenceMode;
    segmentationClasses?: number[];
}

// @public
export interface MaskReferenceImage {
    config?: MaskReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum MaskReferenceMode {
    // (undocumented)
    MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND",
    // (undocumented)
    MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT",
    // (undocumented)
    MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND",
    // (undocumented)
    MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC",
    // (undocumented)
    MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED"
}

// @public (undocumented)
export enum MediaResolution {
    // (undocumented)
    MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH",
    // (undocumented)
    MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW",
    // (undocumented)
    MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM",
    // (undocumented)
    MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED"
}

// @public (undocumented)
export enum Modality {
    // (undocumented)
    AUDIO = "AUDIO",
    // (undocumented)
    IMAGE = "IMAGE",
    // (undocumented)
    MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED",
    // (undocumented)
    TEXT = "TEXT"
}

// @public
export interface ModalityTokenCount {
    modality?: Modality;
    tokenCount?: number;
}

// @public (undocumented)
export enum Mode {
    // (undocumented)
    MODE_DYNAMIC = "MODE_DYNAMIC",
    // (undocumented)
    MODE_UNSPECIFIED = "MODE_UNSPECIFIED"
}

// @public (undocumented)
export class Models extends BaseModule {
    constructor(apiClient: ApiClient);
    computeTokens(params: types.ComputeTokensParameters): Promise<types.ComputeTokensResponse>;
    countTokens(params: types.CountTokensParameters): Promise<types.CountTokensResponse>;
    embedContent(params: types.EmbedContentParameters): Promise<types.EmbedContentResponse>;
    generateContent: (params: types.GenerateContentParameters) => Promise<types.GenerateContentResponse>;
    generateContentStream: (params: types.GenerateContentParameters) => Promise<AsyncGenerator<types.GenerateContentResponse>>;
    generateImages: (params: types.GenerateImagesParameters) => Promise<types.GenerateImagesResponse>;
}

// @public
export enum Outcome {
    // (undocumented)
    OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED",
    // (undocumented)
    OUTCOME_FAILED = "OUTCOME_FAILED",
    // (undocumented)
    OUTCOME_OK = "OUTCOME_OK",
    // (undocumented)
    OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED"
}

// @public
export interface Part {
    codeExecutionResult?: CodeExecutionResult;
    executableCode?: ExecutableCode;
    fileData?: FileData;
    functionCall?: FunctionCall;
    functionResponse?: FunctionResponse;
    inlineData?: Blob_2;
    text?: string;
    thought?: boolean;
    videoMetadata?: VideoMetadata;
}

// @public (undocumented)
export type PartListUnion = PartUnion[] | PartUnion;

// @public (undocumented)
export type PartUnion = Part | string;

// @public (undocumented)
export enum PersonGeneration {
    // (undocumented)
    ALLOW_ADULT = "ALLOW_ADULT",
    // (undocumented)
    ALLOW_ALL = "ALLOW_ALL",
    // (undocumented)
    DONT_ALLOW = "DONT_ALLOW"
}

// @public
export interface PrebuiltVoiceConfig {
    voiceName?: string;
}

// @public
export interface RawReferenceImage {
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public
export interface ReplayFile {
    // (undocumented)
    interactions?: ReplayInteraction[];
    // (undocumented)
    replayId?: string;
}

// @public
export interface ReplayInteraction {
    // (undocumented)
    request?: ReplayRequest;
    // (undocumented)
    response?: ReplayResponse;
}

// @public
export interface ReplayRequest {
    // (undocumented)
    bodySegments?: Record<string, unknown>[];
    // (undocumented)
    headers?: Record<string, string>;
    // (undocumented)
    method?: string;
    // (undocumented)
    url?: string;
}

// @public
export class ReplayResponse {
    // (undocumented)
    bodySegments?: Record<string, unknown>[];
    // (undocumented)
    headers?: Record<string, string>;
    // (undocumented)
    sdkResponseSegments?: Record<string, unknown>[];
    // (undocumented)
    statusCode?: number;
}

// @public
export interface Retrieval {
    disableAttribution?: boolean;
    vertexAiSearch?: VertexAISearch;
    vertexRagStore?: VertexRagStore;
}

// @public
export interface RetrievalMetadata {
    googleSearchDynamicRetrievalScore?: number;
}

// @public
export interface SafetyAttributes {
    categories?: string[];
    contentType?: string;
    scores?: number[];
}

// @public (undocumented)
export enum SafetyFilterLevel {
    // (undocumented)
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    // (undocumented)
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    // (undocumented)
    BLOCK_NONE = "BLOCK_NONE",
    // (undocumented)
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH"
}

// @public
export interface SafetyRating {
    blocked?: boolean;
    category?: HarmCategory;
    probability?: HarmProbability;
    probabilityScore?: number;
    severity?: HarmSeverity;
    severityScore?: number;
}

// @public
export interface SafetySetting {
    category?: HarmCategory;
    method?: HarmBlockMethod;
    threshold?: HarmBlockThreshold;
}

// @public
export interface Schema {
    anyOf?: Schema[];
    default?: unknown;
    description?: string;
    enum?: string[];
    example?: unknown;
    format?: string;
    items?: Schema;
    maximum?: number;
    maxItems?: string;
    maxLength?: string;
    maxProperties?: string;
    minimum?: number;
    minItems?: string;
    minLength?: string;
    minProperties?: string;
    nullable?: boolean;
    pattern?: string;
    properties?: Record<string, Schema>;
    propertyOrdering?: string[];
    required?: string[];
    title?: string;
    type?: Type;
}

// @public (undocumented)
export type SchemaUnion = Schema;

// @public
export interface SearchEntryPoint {
    renderedContent?: string;
    sdkBlob?: string;
}

// @public
export interface Segment {
    endIndex?: number;
    partIndex?: number;
    startIndex?: number;
    text?: string;
}

// @public
export interface SendMessageParameters {
    config?: GenerateContentConfig;
    message: PartListUnion;
}

// @public
export class Session {
    constructor(conn: WebSocket_2, apiClient: ApiClient);
    close(): void;
    // Warning: (ae-forgotten-export) The symbol "WebSocket_2" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    readonly conn: WebSocket_2;
    sendClientContent(params: types.LiveSendClientContentParameters): void;
    sendRealtimeInput(params: types.LiveSendRealtimeInputParameters): void;
    sendToolResponse(params: types.LiveSendToolResponseParameters): void;
}

// @public
export interface SpeechConfig {
    voiceConfig?: VoiceConfig;
}

// @public (undocumented)
export type SpeechConfigUnion = SpeechConfig | string;

// @public (undocumented)
export enum State {
    // (undocumented)
    ACTIVE = "ACTIVE",
    // (undocumented)
    ERROR = "ERROR",
    // (undocumented)
    STATE_UNSPECIFIED = "STATE_UNSPECIFIED"
}

// @public
export interface StyleReferenceConfig {
    styleDescription?: string;
}

// @public
export interface StyleReferenceImage {
    config?: StyleReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public
export interface SubjectReferenceConfig {
    subjectDescription?: string;
    subjectType?: SubjectReferenceType;
}

// @public
export interface SubjectReferenceImage {
    config?: SubjectReferenceConfig;
    referenceId?: number;
    referenceImage?: Image_2;
    referenceType?: string;
}

// @public (undocumented)
export enum SubjectReferenceType {
    // (undocumented)
    SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL",
    // (undocumented)
    SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT",
    // (undocumented)
    SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON",
    // (undocumented)
    SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT"
}

// @public (undocumented)
export interface TestTableFile {
    // (undocumented)
    comment?: string;
    // (undocumented)
    parameterNames?: string[];
    // (undocumented)
    testMethod?: string;
    // (undocumented)
    testTable?: TestTableItem[];
}

// @public (undocumented)
export interface TestTableItem {
    exceptionIfMldev?: string;
    exceptionIfVertex?: string;
    hasUnion?: boolean;
    ignoreKeys?: string[];
    name?: string;
    overrideReplayId?: string;
    parameters?: Record<string, unknown>;
    skipInApiMode?: string;
}

// @public
export interface ThinkingConfig {
    includeThoughts?: boolean;
}

// @public
export interface TokensInfo {
    role?: string;
    tokenIds?: string[];
    tokens?: string[];
}

// @public
export interface Tool {
    codeExecution?: ToolCodeExecution;
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: GoogleSearch;
    googleSearchRetrieval?: GoogleSearchRetrieval;
    retrieval?: Retrieval;
}

// @public
export interface ToolCodeExecution {
}

// @public
export interface ToolConfig {
    functionCallingConfig?: FunctionCallingConfig;
}

// @public (undocumented)
export type ToolListUnion = Tool[];

// @public (undocumented)
export enum Type {
    // (undocumented)
    ARRAY = "ARRAY",
    // (undocumented)
    BOOLEAN = "BOOLEAN",
    // (undocumented)
    INTEGER = "INTEGER",
    // (undocumented)
    NUMBER = "NUMBER",
    // (undocumented)
    OBJECT = "OBJECT",
    // (undocumented)
    STRING = "STRING",
    // (undocumented)
    TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED"
}

// @public
export interface UpdateCachedContentConfig {
    expireTime?: string;
    httpOptions?: HttpOptions;
    ttl?: string;
}

// @public (undocumented)
export interface UpdateCachedContentParameters {
    config?: UpdateCachedContentConfig;
    name: string;
}

// @public
export interface UploadFileConfig {
    displayName?: string;
    httpOptions?: HttpOptions;
    mimeType?: string;
    name?: string;
}

// @public
export interface UpscaleImageConfig {
    httpOptions?: HttpOptions;
    includeRaiReason?: boolean;
    outputCompressionQuality?: number;
    outputMimeType?: string;
}

// @public
export interface UpscaleImageParameters {
    config?: UpscaleImageConfig;
    image: Image_2;
    model: string;
    upscaleFactor: string;
}

// @public
export interface VertexAISearch {
    datastore?: string;
}

// @public
export interface VertexRagStore {
    ragCorpora?: string[];
    ragResources?: VertexRagStoreRagResource[];
    similarityTopK?: number;
    vectorDistanceThreshold?: number;
}

// @public
export interface VertexRagStoreRagResource {
    ragCorpus?: string;
    ragFileIds?: string[];
}

// @public
export interface VideoMetadata {
    endOffset?: string;
    startOffset?: string;
}

// @public
export interface VoiceConfig {
    prebuiltVoiceConfig?: PrebuiltVoiceConfig;
}

// (No @packageDocumentation comment for this package)

```



================================================
File: docs/assets/hierarchy.js
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

window.hierarchyData = "eJyrVirKzy8pVrKKjtVRKkpNy0lNLsnMzwMKVNfWAgCbHgqm"


================================================
File: docs/assets/icons.js
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

(function() {
    addIcons();
    function addIcons() {
        if (document.readyState === "loading") return document.addEventListener("DOMContentLoaded", addIcons);
        const svg = document.body.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        svg.innerHTML = `<g id="icon-1" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-module)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">M</text></g><g id="icon-2" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-module)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">M</text></g><g id="icon-4" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-namespace)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">N</text></g><g id="icon-8" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-enum)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">E</text></g><g id="icon-16" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-property)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">P</text></g><g id="icon-32" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-variable)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">V</text></g><g id="icon-64" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-function)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">F</text></g><g id="icon-128" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-class)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">C</text></g><g id="icon-256" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-interface)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">I</text></g><g id="icon-512" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-constructor)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">C</text></g><g id="icon-1024" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-property)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">P</text></g><g id="icon-2048" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-method)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">M</text></g><g id="icon-4096" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-function)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">F</text></g><g id="icon-8192" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-property)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">P</text></g><g id="icon-16384" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-constructor)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">C</text></g><g id="icon-32768" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-property)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">P</text></g><g id="icon-65536" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-type-alias)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">T</text></g><g id="icon-131072" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-type-alias)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">T</text></g><g id="icon-262144" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-accessor)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">A</text></g><g id="icon-524288" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-accessor)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">A</text></g><g id="icon-1048576" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-accessor)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">A</text></g><g id="icon-2097152" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-type-alias)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">T</text></g><g id="icon-4194304" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-reference)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="12"></rect><text fill="var(--color-icon-text)" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">R</text></g><g id="icon-8388608" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-document)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><g stroke="var(--color-icon-text)" fill="none" stroke-width="1.5"><polygon points="6,5 6,19 18,19, 18,10 13,5"></polygon><line x1="9" y1="9" x2="13" y2="9"></line><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></g></g><g id="icon-folder" class="tsd-no-select"><rect fill="var(--color-icon-background)" stroke="var(--color-document)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><g stroke="var(--color-icon-text)" fill="none" stroke-width="1.5"><polygon points="5,5 10,5 12,8 19,8 19,18 5,18"></polygon></g></g><g id="icon-chevronDown" class="tsd-no-select"><path d="M4.93896 8.531L12 15.591L19.061 8.531L16.939 6.409L12 11.349L7.06098 6.409L4.93896 8.531Z" fill="var(--color-icon-text)"></path></g><g id="icon-chevronSmall" class="tsd-no-select"><path d="M1.5 5.50969L8 11.6609L14.5 5.50969L12.5466 3.66086L8 7.96494L3.45341 3.66086L1.5 5.50969Z" fill="var(--color-icon-text)"></path></g><g id="icon-checkbox" class="tsd-no-select"><rect class="tsd-checkbox-background" width="30" height="30" x="1" y="1" rx="6" fill="none"></rect><path class="tsd-checkbox-checkmark" d="M8.35422 16.8214L13.2143 21.75L24.6458 10.25" stroke="none" stroke-width="3.5" stroke-linejoin="round" fill="none"></path></g><g id="icon-menu" class="tsd-no-select"><rect x="1" y="3" width="14" height="2" fill="var(--color-icon-text)"></rect><rect x="1" y="7" width="14" height="2" fill="var(--color-icon-text)"></rect><rect x="1" y="11" width="14" height="2" fill="var(--color-icon-text)"></rect></g><g id="icon-search" class="tsd-no-select"><path d="M15.7824 13.833L12.6666 10.7177C12.5259 10.5771 12.3353 10.499 12.1353 10.499H11.6259C12.4884 9.39596 13.001 8.00859 13.001 6.49937C13.001 2.90909 10.0914 0 6.50048 0C2.90959 0 0 2.90909 0 6.49937C0 10.0896 2.90959 12.9987 6.50048 12.9987C8.00996 12.9987 9.39756 12.4863 10.5008 11.6239V12.1332C10.5008 12.3332 10.5789 12.5238 10.7195 12.6644L13.8354 15.7797C14.1292 16.0734 14.6042 16.0734 14.8948 15.7797L15.7793 14.8954C16.0731 14.6017 16.0731 14.1267 15.7824 13.833ZM6.50048 10.499C4.29094 10.499 2.50018 8.71165 2.50018 6.49937C2.50018 4.29021 4.28781 2.49976 6.50048 2.49976C8.71001 2.49976 10.5008 4.28708 10.5008 6.49937C10.5008 8.70852 8.71314 10.499 6.50048 10.499Z" fill="var(--color-icon-text)"></path></g><g id="icon-anchor" class="tsd-no-select"><g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5"></path><path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5"></path></g></g><g id="icon-alertNote" class="tsd-no-select"><path fill="var(--color-alert-note)" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></g><g id="icon-alertTip" class="tsd-no-select"><path fill="var(--color-alert-tip)" d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></g><g id="icon-alertImportant" class="tsd-no-select"><path fill="var(--color-alert-important)" d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></g><g id="icon-alertWarning" class="tsd-no-select"><path fill="var(--color-alert-warning)" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></g><g id="icon-alertCaution" class="tsd-no-select"><path fill="var(--color-alert-caution)" d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></g>`;
        svg.style.display = "none";
        if (location.protocol === "file:") updateUseElements();
    }

    function updateUseElements() {
        document.querySelectorAll("use").forEach(el => {
            if (el.getAttribute("href").includes("#icon-")) {
                el.setAttribute("href", el.getAttribute("href").replace(/.*#/, "#"));
            }
        });
    }
})()


================================================
File: docs/assets/main.js
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
window.translations={"copy":"Copy","copied":"Copied!","normally_hidden":"This member is normally hidden due to your filter settings.","hierarchy_expand":"Expand","hierarchy_collapse":"Collapse","folder":"Folder","kind_1":"Project","kind_2":"Module","kind_4":"Namespace","kind_8":"Enumeration","kind_16":"Enumeration Member","kind_32":"Variable","kind_64":"Function","kind_128":"Class","kind_256":"Interface","kind_512":"Constructor","kind_1024":"Property","kind_2048":"Method","kind_4096":"Call Signature","kind_8192":"Index Signature","kind_16384":"Constructor Signature","kind_32768":"Parameter","kind_65536":"Type Literal","kind_131072":"Type Parameter","kind_262144":"Accessor","kind_524288":"Get Signature","kind_1048576":"Set Signature","kind_2097152":"Type Alias","kind_4194304":"Reference","kind_8388608":"Document"};
"use strict";(()=>{var De=Object.create;var le=Object.defineProperty;var Fe=Object.getOwnPropertyDescriptor;var Ne=Object.getOwnPropertyNames;var Ve=Object.getPrototypeOf,Be=Object.prototype.hasOwnProperty;var qe=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var je=(t,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Ne(e))!Be.call(t,i)&&i!==n&&le(t,i,{get:()=>e[i],enumerable:!(r=Fe(e,i))||r.enumerable});return t};var $e=(t,e,n)=>(n=t!=null?De(Ve(t)):{},je(e||!t||!t.__esModule?le(n,"default",{value:t,enumerable:!0}):n,t));var pe=qe((de,he)=>{(function(){var t=function(e){var n=new t.Builder;return n.pipeline.add(t.trimmer,t.stopWordFilter,t.stemmer),n.searchPipeline.add(t.stemmer),e.call(n,n),n.build()};t.version="2.3.9";t.utils={},t.utils.warn=function(e){return function(n){e.console&&console.warn&&console.warn(n)}}(this),t.utils.asString=function(e){return e==null?"":e.toString()},t.utils.clone=function(e){if(e==null)return e;for(var n=Object.create(null),r=Object.keys(e),i=0;i<r.length;i++){var s=r[i],o=e[s];if(Array.isArray(o)){n[s]=o.slice();continue}if(typeof o=="string"||typeof o=="number"||typeof o=="boolean"){n[s]=o;continue}throw new TypeError("clone is not deep and does not support nested objects")}return n},t.FieldRef=function(e,n,r){this.docRef=e,this.fieldName=n,this._stringValue=r},t.FieldRef.joiner="/",t.FieldRef.fromString=function(e){var n=e.indexOf(t.FieldRef.joiner);if(n===-1)throw"malformed field ref string";var r=e.slice(0,n),i=e.slice(n+1);return new t.FieldRef(i,r,e)},t.FieldRef.prototype.toString=function(){return this._stringValue==null&&(this._stringValue=this.fieldName+t.FieldRef.joiner+this.docRef),this._stringValue};t.Set=function(e){if(this.elements=Object.create(null),e){this.length=e.length;for(var n=0;n<this.length;n++)this.elements[e[n]]=!0}else this.length=0},t.Set.complete={intersect:function(e){return e},union:function(){return this},contains:function(){return!0}},t.Set.empty={intersect:function(){return this},union:function(e){return e},contains:function(){return!1}},t.Set.prototype.contains=function(e){return!!this.elements[e]},t.Set.prototype.intersect=function(e){var n,r,i,s=[];if(e===t.Set.complete)return this;if(e===t.Set.empty)return e;this.length<e.length?(n=this,r=e):(n=e,r=this),i=Object.keys(n.elements);for(var o=0;o<i.length;o++){var a=i[o];a in r.elements&&s.push(a)}return new t.Set(s)},t.Set.prototype.union=function(e){return e===t.Set.complete?t.Set.complete:e===t.Set.empty?this:new t.Set(Object.keys(this.elements).concat(Object.keys(e.elements)))},t.idf=function(e,n){var r=0;for(var i in e)i!="_index"&&(r+=Object.keys(e[i]).length);var s=(n-r+.5)/(r+.5);return Math.log(1+Math.abs(s))},t.Token=function(e,n){this.str=e||"",this.metadata=n||{}},t.Token.prototype.toString=function(){return this.str},t.Token.prototype.update=function(e){return this.str=e(this.str,this.metadata),this},t.Token.prototype.clone=function(e){return e=e||function(n){return n},new t.Token(e(this.str,this.metadata),this.metadata)};t.tokenizer=function(e,n){if(e==null||e==null)return[];if(Array.isArray(e))return e.map(function(m){return new t.Token(t.utils.asString(m).toLowerCase(),t.utils.clone(n))});for(var r=e.toString().toLowerCase(),i=r.length,s=[],o=0,a=0;o<=i;o++){var l=r.charAt(o),c=o-a;if(l.match(t.tokenizer.separator)||o==i){if(c>0){var d=t.utils.clone(n)||{};d.position=[a,c],d.index=s.length,s.push(new t.Token(r.slice(a,o),d))}a=o+1}}return s},t.tokenizer.separator=/[\s\-]+/;t.Pipeline=function(){this._stack=[]},t.Pipeline.registeredFunctions=Object.create(null),t.Pipeline.registerFunction=function(e,n){n in this.registeredFunctions&&t.utils.warn("Overwriting existing registered function: "+n),e.label=n,t.Pipeline.registeredFunctions[e.label]=e},t.Pipeline.warnIfFunctionNotRegistered=function(e){var n=e.label&&e.label in this.registeredFunctions;n||t.utils.warn(`Function is not registered with pipeline. This may cause problems when serialising the index.
`,e)},t.Pipeline.load=function(e){var n=new t.Pipeline;return e.forEach(function(r){var i=t.Pipeline.registeredFunctions[r];if(i)n.add(i);else throw new Error("Cannot load unregistered function: "+r)}),n},t.Pipeline.prototype.add=function(){var e=Array.prototype.slice.call(arguments);e.forEach(function(n){t.Pipeline.warnIfFunctionNotRegistered(n),this._stack.push(n)},this)},t.Pipeline.prototype.after=function(e,n){t.Pipeline.warnIfFunctionNotRegistered(n);var r=this._stack.indexOf(e);if(r==-1)throw new Error("Cannot find existingFn");r=r+1,this._stack.splice(r,0,n)},t.Pipeline.prototype.before=function(e,n){t.Pipeline.warnIfFunctionNotRegistered(n);var r=this._stack.indexOf(e);if(r==-1)throw new Error("Cannot find existingFn");this._stack.splice(r,0,n)},t.Pipeline.prototype.remove=function(e){var n=this._stack.indexOf(e);n!=-1&&this._stack.splice(n,1)},t.Pipeline.prototype.run=function(e){for(var n=this._stack.length,r=0;r<n;r++){for(var i=this._stack[r],s=[],o=0;o<e.length;o++){var a=i(e[o],o,e);if(!(a==null||a===""))if(Array.isArray(a))for(var l=0;l<a.length;l++)s.push(a[l]);else s.push(a)}e=s}return e},t.Pipeline.prototype.runString=function(e,n){var r=new t.Token(e,n);return this.run([r]).map(function(i){return i.toString()})},t.Pipeline.prototype.reset=function(){this._stack=[]},t.Pipeline.prototype.toJSON=function(){return this._stack.map(function(e){return t.Pipeline.warnIfFunctionNotRegistered(e),e.label})};t.Vector=function(e){this._magnitude=0,this.elements=e||[]},t.Vector.prototype.positionForIndex=function(e){if(this.elements.length==0)return 0;for(var n=0,r=this.elements.length/2,i=r-n,s=Math.floor(i/2),o=this.elements[s*2];i>1&&(o<e&&(n=s),o>e&&(r=s),o!=e);)i=r-n,s=n+Math.floor(i/2),o=this.elements[s*2];if(o==e||o>e)return s*2;if(o<e)return(s+1)*2},t.Vector.prototype.insert=function(e,n){this.upsert(e,n,function(){throw"duplicate index"})},t.Vector.prototype.upsert=function(e,n,r){this._magnitude=0;var i=this.positionForIndex(e);this.elements[i]==e?this.elements[i+1]=r(this.elements[i+1],n):this.elements.splice(i,0,e,n)},t.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var e=0,n=this.elements.length,r=1;r<n;r+=2){var i=this.elements[r];e+=i*i}return this._magnitude=Math.sqrt(e)},t.Vector.prototype.dot=function(e){for(var n=0,r=this.elements,i=e.elements,s=r.length,o=i.length,a=0,l=0,c=0,d=0;c<s&&d<o;)a=r[c],l=i[d],a<l?c+=2:a>l?d+=2:a==l&&(n+=r[c+1]*i[d+1],c+=2,d+=2);return n},t.Vector.prototype.similarity=function(e){return this.dot(e)/this.magnitude()||0},t.Vector.prototype.toArray=function(){for(var e=new Array(this.elements.length/2),n=1,r=0;n<this.elements.length;n+=2,r++)e[r]=this.elements[n];return e},t.Vector.prototype.toJSON=function(){return this.elements};t.stemmer=function(){var e={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},n={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},r="[^aeiou]",i="[aeiouy]",s=r+"[^aeiouy]*",o=i+"[aeiou]*",a="^("+s+")?"+o+s,l="^("+s+")?"+o+s+"("+o+")?$",c="^("+s+")?"+o+s+o+s,d="^("+s+")?"+i,m=new RegExp(a),p=new RegExp(c),L=new RegExp(l),v=new RegExp(d),b=/^(.+?)(ss|i)es$/,f=/^(.+?)([^s])s$/,y=/^(.+?)eed$/,S=/^(.+?)(ed|ing)$/,w=/.$/,k=/(at|bl|iz)$/,O=new RegExp("([^aeiouylsz])\\1$"),q=new RegExp("^"+s+i+"[^aeiouwxy]$"),F=/^(.+?[^aeiou])y$/,j=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,$=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,N=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,z=/^(.+?)(s|t)(ion)$/,Q=/^(.+?)e$/,W=/ll$/,U=new RegExp("^"+s+i+"[^aeiouwxy]$"),V=function(u){var g,P,T,h,x,_,R;if(u.length<3)return u;if(T=u.substr(0,1),T=="y"&&(u=T.toUpperCase()+u.substr(1)),h=b,x=f,h.test(u)?u=u.replace(h,"$1$2"):x.test(u)&&(u=u.replace(x,"$1$2")),h=y,x=S,h.test(u)){var E=h.exec(u);h=m,h.test(E[1])&&(h=w,u=u.replace(h,""))}else if(x.test(u)){var E=x.exec(u);g=E[1],x=v,x.test(g)&&(u=g,x=k,_=O,R=q,x.test(u)?u=u+"e":_.test(u)?(h=w,u=u.replace(h,"")):R.test(u)&&(u=u+"e"))}if(h=F,h.test(u)){var E=h.exec(u);g=E[1],u=g+"i"}if(h=j,h.test(u)){var E=h.exec(u);g=E[1],P=E[2],h=m,h.test(g)&&(u=g+e[P])}if(h=$,h.test(u)){var E=h.exec(u);g=E[1],P=E[2],h=m,h.test(g)&&(u=g+n[P])}if(h=N,x=z,h.test(u)){var E=h.exec(u);g=E[1],h=p,h.test(g)&&(u=g)}else if(x.test(u)){var E=x.exec(u);g=E[1]+E[2],x=p,x.test(g)&&(u=g)}if(h=Q,h.test(u)){var E=h.exec(u);g=E[1],h=p,x=L,_=U,(h.test(g)||x.test(g)&&!_.test(g))&&(u=g)}return h=W,x=p,h.test(u)&&x.test(u)&&(h=w,u=u.replace(h,"")),T=="y"&&(u=T.toLowerCase()+u.substr(1)),u};return function(M){return M.update(V)}}(),t.Pipeline.registerFunction(t.stemmer,"stemmer");t.generateStopWordFilter=function(e){var n=e.reduce(function(r,i){return r[i]=i,r},{});return function(r){if(r&&n[r.toString()]!==r.toString())return r}},t.stopWordFilter=t.generateStopWordFilter(["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"]),t.Pipeline.registerFunction(t.stopWordFilter,"stopWordFilter");t.trimmer=function(e){return e.update(function(n){return n.replace(/^\W+/,"").replace(/\W+$/,"")})},t.Pipeline.registerFunction(t.trimmer,"trimmer");t.TokenSet=function(){this.final=!1,this.edges={},this.id=t.TokenSet._nextId,t.TokenSet._nextId+=1},t.TokenSet._nextId=1,t.TokenSet.fromArray=function(e){for(var n=new t.TokenSet.Builder,r=0,i=e.length;r<i;r++)n.insert(e[r]);return n.finish(),n.root},t.TokenSet.fromClause=function(e){return"editDistance"in e?t.TokenSet.fromFuzzyString(e.term,e.editDistance):t.TokenSet.fromString(e.term)},t.TokenSet.fromFuzzyString=function(e,n){for(var r=new t.TokenSet,i=[{node:r,editsRemaining:n,str:e}];i.length;){var s=i.pop();if(s.str.length>0){var o=s.str.charAt(0),a;o in s.node.edges?a=s.node.edges[o]:(a=new t.TokenSet,s.node.edges[o]=a),s.str.length==1&&(a.final=!0),i.push({node:a,editsRemaining:s.editsRemaining,str:s.str.slice(1)})}if(s.editsRemaining!=0){if("*"in s.node.edges)var l=s.node.edges["*"];else{var l=new t.TokenSet;s.node.edges["*"]=l}if(s.str.length==0&&(l.final=!0),i.push({node:l,editsRemaining:s.editsRemaining-1,str:s.str}),s.str.length>1&&i.push({node:s.node,editsRemaining:s.editsRemaining-1,str:s.str.slice(1)}),s.str.length==1&&(s.node.final=!0),s.str.length>=1){if("*"in s.node.edges)var c=s.node.edges["*"];else{var c=new t.TokenSet;s.node.edges["*"]=c}s.str.length==1&&(c.final=!0),i.push({node:c,editsRemaining:s.editsRemaining-1,str:s.str.slice(1)})}if(s.str.length>1){var d=s.str.charAt(0),m=s.str.charAt(1),p;m in s.node.edges?p=s.node.edges[m]:(p=new t.TokenSet,s.node.edges[m]=p),s.str.length==1&&(p.final=!0),i.push({node:p,editsRemaining:s.editsRemaining-1,str:d+s.str.slice(2)})}}}return r},t.TokenSet.fromString=function(e){for(var n=new t.TokenSet,r=n,i=0,s=e.length;i<s;i++){var o=e[i],a=i==s-1;if(o=="*")n.edges[o]=n,n.final=a;else{var l=new t.TokenSet;l.final=a,n.edges[o]=l,n=l}}return r},t.TokenSet.prototype.toArray=function(){for(var e=[],n=[{prefix:"",node:this}];n.length;){var r=n.pop(),i=Object.keys(r.node.edges),s=i.length;r.node.final&&(r.prefix.charAt(0),e.push(r.prefix));for(var o=0;o<s;o++){var a=i[o];n.push({prefix:r.prefix.concat(a),node:r.node.edges[a]})}}return e},t.TokenSet.prototype.toString=function(){if(this._str)return this._str;for(var e=this.final?"1":"0",n=Object.keys(this.edges).sort(),r=n.length,i=0;i<r;i++){var s=n[i],o=this.edges[s];e=e+s+o.id}return e},t.TokenSet.prototype.intersect=function(e){for(var n=new t.TokenSet,r=void 0,i=[{qNode:e,output:n,node:this}];i.length;){r=i.pop();for(var s=Object.keys(r.qNode.edges),o=s.length,a=Object.keys(r.node.edges),l=a.length,c=0;c<o;c++)for(var d=s[c],m=0;m<l;m++){var p=a[m];if(p==d||d=="*"){var L=r.node.edges[p],v=r.qNode.edges[d],b=L.final&&v.final,f=void 0;p in r.output.edges?(f=r.output.edges[p],f.final=f.final||b):(f=new t.TokenSet,f.final=b,r.output.edges[p]=f),i.push({qNode:v,output:f,node:L})}}}return n},t.TokenSet.Builder=function(){this.previousWord="",this.root=new t.TokenSet,this.uncheckedNodes=[],this.minimizedNodes={}},t.TokenSet.Builder.prototype.insert=function(e){var n,r=0;if(e<this.previousWord)throw new Error("Out of order word insertion");for(var i=0;i<e.length&&i<this.previousWord.length&&e[i]==this.previousWord[i];i++)r++;this.minimize(r),this.uncheckedNodes.length==0?n=this.root:n=this.uncheckedNodes[this.uncheckedNodes.length-1].child;for(var i=r;i<e.length;i++){var s=new t.TokenSet,o=e[i];n.edges[o]=s,this.uncheckedNodes.push({parent:n,char:o,child:s}),n=s}n.final=!0,this.previousWord=e},t.TokenSet.Builder.prototype.finish=function(){this.minimize(0)},t.TokenSet.Builder.prototype.minimize=function(e){for(var n=this.uncheckedNodes.length-1;n>=e;n--){var r=this.uncheckedNodes[n],i=r.child.toString();i in this.minimizedNodes?r.parent.edges[r.char]=this.minimizedNodes[i]:(r.child._str=i,this.minimizedNodes[i]=r.child),this.uncheckedNodes.pop()}};t.Index=function(e){this.invertedIndex=e.invertedIndex,this.fieldVectors=e.fieldVectors,this.tokenSet=e.tokenSet,this.fields=e.fields,this.pipeline=e.pipeline},t.Index.prototype.search=function(e){return this.query(function(n){var r=new t.QueryParser(e,n);r.parse()})},t.Index.prototype.query=function(e){for(var n=new t.Query(this.fields),r=Object.create(null),i=Object.create(null),s=Object.create(null),o=Object.create(null),a=Object.create(null),l=0;l<this.fields.length;l++)i[this.fields[l]]=new t.Vector;e.call(n,n);for(var l=0;l<n.clauses.length;l++){var c=n.clauses[l],d=null,m=t.Set.empty;c.usePipeline?d=this.pipeline.runString(c.term,{fields:c.fields}):d=[c.term];for(var p=0;p<d.length;p++){var L=d[p];c.term=L;var v=t.TokenSet.fromClause(c),b=this.tokenSet.intersect(v).toArray();if(b.length===0&&c.presence===t.Query.presence.REQUIRED){for(var f=0;f<c.fields.length;f++){var y=c.fields[f];o[y]=t.Set.empty}break}for(var S=0;S<b.length;S++)for(var w=b[S],k=this.invertedIndex[w],O=k._index,f=0;f<c.fields.length;f++){var y=c.fields[f],q=k[y],F=Object.keys(q),j=w+"/"+y,$=new t.Set(F);if(c.presence==t.Query.presence.REQUIRED&&(m=m.union($),o[y]===void 0&&(o[y]=t.Set.complete)),c.presence==t.Query.presence.PROHIBITED){a[y]===void 0&&(a[y]=t.Set.empty),a[y]=a[y].union($);continue}if(i[y].upsert(O,c.boost,function(Ae,He){return Ae+He}),!s[j]){for(var N=0;N<F.length;N++){var z=F[N],Q=new t.FieldRef(z,y),W=q[z],U;(U=r[Q])===void 0?r[Q]=new t.MatchData(w,y,W):U.add(w,y,W)}s[j]=!0}}}if(c.presence===t.Query.presence.REQUIRED)for(var f=0;f<c.fields.length;f++){var y=c.fields[f];o[y]=o[y].intersect(m)}}for(var V=t.Set.complete,M=t.Set.empty,l=0;l<this.fields.length;l++){var y=this.fields[l];o[y]&&(V=V.intersect(o[y])),a[y]&&(M=M.union(a[y]))}var u=Object.keys(r),g=[],P=Object.create(null);if(n.isNegated()){u=Object.keys(this.fieldVectors);for(var l=0;l<u.length;l++){var Q=u[l],T=t.FieldRef.fromString(Q);r[Q]=new t.MatchData}}for(var l=0;l<u.length;l++){var T=t.FieldRef.fromString(u[l]),h=T.docRef;if(V.contains(h)&&!M.contains(h)){var x=this.fieldVectors[T],_=i[T.fieldName].similarity(x),R;if((R=P[h])!==void 0)R.score+=_,R.matchData.combine(r[T]);else{var E={ref:h,score:_,matchData:r[T]};P[h]=E,g.push(E)}}}return g.sort(function(Me,Re){return Re.score-Me.score})},t.Index.prototype.toJSON=function(){var e=Object.keys(this.invertedIndex).sort().map(function(r){return[r,this.invertedIndex[r]]},this),n=Object.keys(this.fieldVectors).map(function(r){return[r,this.fieldVectors[r].toJSON()]},this);return{version:t.version,fields:this.fields,fieldVectors:n,invertedIndex:e,pipeline:this.pipeline.toJSON()}},t.Index.load=function(e){var n={},r={},i=e.fieldVectors,s=Object.create(null),o=e.invertedIndex,a=new t.TokenSet.Builder,l=t.Pipeline.load(e.pipeline);e.version!=t.version&&t.utils.warn("Version mismatch when loading serialised index. Current version of lunr '"+t.version+"' does not match serialized index '"+e.version+"'");for(var c=0;c<i.length;c++){var d=i[c],m=d[0],p=d[1];r[m]=new t.Vector(p)}for(var c=0;c<o.length;c++){var d=o[c],L=d[0],v=d[1];a.insert(L),s[L]=v}return a.finish(),n.fields=e.fields,n.fieldVectors=r,n.invertedIndex=s,n.tokenSet=a.root,n.pipeline=l,new t.Index(n)};t.Builder=function(){this._ref="id",this._fields=Object.create(null),this._documents=Object.create(null),this.invertedIndex=Object.create(null),this.fieldTermFrequencies={},this.fieldLengths={},this.tokenizer=t.tokenizer,this.pipeline=new t.Pipeline,this.searchPipeline=new t.Pipeline,this.documentCount=0,this._b=.75,this._k1=1.2,this.termIndex=0,this.metadataWhitelist=[]},t.Builder.prototype.ref=function(e){this._ref=e},t.Builder.prototype.field=function(e,n){if(/\//.test(e))throw new RangeError("Field '"+e+"' contains illegal character '/'");this._fields[e]=n||{}},t.Builder.prototype.b=function(e){e<0?this._b=0:e>1?this._b=1:this._b=e},t.Builder.prototype.k1=function(e){this._k1=e},t.Builder.prototype.add=function(e,n){var r=e[this._ref],i=Object.keys(this._fields);this._documents[r]=n||{},this.documentCount+=1;for(var s=0;s<i.length;s++){var o=i[s],a=this._fields[o].extractor,l=a?a(e):e[o],c=this.tokenizer(l,{fields:[o]}),d=this.pipeline.run(c),m=new t.FieldRef(r,o),p=Object.create(null);this.fieldTermFrequencies[m]=p,this.fieldLengths[m]=0,this.fieldLengths[m]+=d.length;for(var L=0;L<d.length;L++){var v=d[L];if(p[v]==null&&(p[v]=0),p[v]+=1,this.invertedIndex[v]==null){var b=Object.create(null);b._index=this.termIndex,this.termIndex+=1;for(var f=0;f<i.length;f++)b[i[f]]=Object.create(null);this.invertedIndex[v]=b}this.invertedIndex[v][o][r]==null&&(this.invertedIndex[v][o][r]=Object.create(null));for(var y=0;y<this.metadataWhitelist.length;y++){var S=this.metadataWhitelist[y],w=v.metadata[S];this.invertedIndex[v][o][r][S]==null&&(this.invertedIndex[v][o][r][S]=[]),this.invertedIndex[v][o][r][S].push(w)}}}},t.Builder.prototype.calculateAverageFieldLengths=function(){for(var e=Object.keys(this.fieldLengths),n=e.length,r={},i={},s=0;s<n;s++){var o=t.FieldRef.fromString(e[s]),a=o.fieldName;i[a]||(i[a]=0),i[a]+=1,r[a]||(r[a]=0),r[a]+=this.fieldLengths[o]}for(var l=Object.keys(this._fields),s=0;s<l.length;s++){var c=l[s];r[c]=r[c]/i[c]}this.averageFieldLength=r},t.Builder.prototype.createFieldVectors=function(){for(var e={},n=Object.keys(this.fieldTermFrequencies),r=n.length,i=Object.create(null),s=0;s<r;s++){for(var o=t.FieldRef.fromString(n[s]),a=o.fieldName,l=this.fieldLengths[o],c=new t.Vector,d=this.fieldTermFrequencies[o],m=Object.keys(d),p=m.length,L=this._fields[a].boost||1,v=this._documents[o.docRef].boost||1,b=0;b<p;b++){var f=m[b],y=d[f],S=this.invertedIndex[f]._index,w,k,O;i[f]===void 0?(w=t.idf(this.invertedIndex[f],this.documentCount),i[f]=w):w=i[f],k=w*((this._k1+1)*y)/(this._k1*(1-this._b+this._b*(l/this.averageFieldLength[a]))+y),k*=L,k*=v,O=Math.round(k*1e3)/1e3,c.insert(S,O)}e[o]=c}this.fieldVectors=e},t.Builder.prototype.createTokenSet=function(){this.tokenSet=t.TokenSet.fromArray(Object.keys(this.invertedIndex).sort())},t.Builder.prototype.build=function(){return this.calculateAverageFieldLengths(),this.createFieldVectors(),this.createTokenSet(),new t.Index({invertedIndex:this.invertedIndex,fieldVectors:this.fieldVectors,tokenSet:this.tokenSet,fields:Object.keys(this._fields),pipeline:this.searchPipeline})},t.Builder.prototype.use=function(e){var n=Array.prototype.slice.call(arguments,1);n.unshift(this),e.apply(this,n)},t.MatchData=function(e,n,r){for(var i=Object.create(null),s=Object.keys(r||{}),o=0;o<s.length;o++){var a=s[o];i[a]=r[a].slice()}this.metadata=Object.create(null),e!==void 0&&(this.metadata[e]=Object.create(null),this.metadata[e][n]=i)},t.MatchData.prototype.combine=function(e){for(var n=Object.keys(e.metadata),r=0;r<n.length;r++){var i=n[r],s=Object.keys(e.metadata[i]);this.metadata[i]==null&&(this.metadata[i]=Object.create(null));for(var o=0;o<s.length;o++){var a=s[o],l=Object.keys(e.metadata[i][a]);this.metadata[i][a]==null&&(this.metadata[i][a]=Object.create(null));for(var c=0;c<l.length;c++){var d=l[c];this.metadata[i][a][d]==null?this.metadata[i][a][d]=e.metadata[i][a][d]:this.metadata[i][a][d]=this.metadata[i][a][d].concat(e.metadata[i][a][d])}}}},t.MatchData.prototype.add=function(e,n,r){if(!(e in this.metadata)){this.metadata[e]=Object.create(null),this.metadata[e][n]=r;return}if(!(n in this.metadata[e])){this.metadata[e][n]=r;return}for(var i=Object.keys(r),s=0;s<i.length;s++){var o=i[s];o in this.metadata[e][n]?this.metadata[e][n][o]=this.metadata[e][n][o].concat(r[o]):this.metadata[e][n][o]=r[o]}},t.Query=function(e){this.clauses=[],this.allFields=e},t.Query.wildcard=new String("*"),t.Query.wildcard.NONE=0,t.Query.wildcard.LEADING=1,t.Query.wildcard.TRAILING=2,t.Query.presence={OPTIONAL:1,REQUIRED:2,PROHIBITED:3},t.Query.prototype.clause=function(e){return"fields"in e||(e.fields=this.allFields),"boost"in e||(e.boost=1),"usePipeline"in e||(e.usePipeline=!0),"wildcard"in e||(e.wildcard=t.Query.wildcard.NONE),e.wildcard&t.Query.wildcard.LEADING&&e.term.charAt(0)!=t.Query.wildcard&&(e.term="*"+e.term),e.wildcard&t.Query.wildcard.TRAILING&&e.term.slice(-1)!=t.Query.wildcard&&(e.term=""+e.term+"*"),"presence"in e||(e.presence=t.Query.presence.OPTIONAL),this.clauses.push(e),this},t.Query.prototype.isNegated=function(){for(var e=0;e<this.clauses.length;e++)if(this.clauses[e].presence!=t.Query.presence.PROHIBITED)return!1;return!0},t.Query.prototype.term=function(e,n){if(Array.isArray(e))return e.forEach(function(i){this.term(i,t.utils.clone(n))},this),this;var r=n||{};return r.term=e.toString(),this.clause(r),this},t.QueryParseError=function(e,n,r){this.name="QueryParseError",this.message=e,this.start=n,this.end=r},t.QueryParseError.prototype=new Error,t.QueryLexer=function(e){this.lexemes=[],this.str=e,this.length=e.length,this.pos=0,this.start=0,this.escapeCharPositions=[]},t.QueryLexer.prototype.run=function(){for(var e=t.QueryLexer.lexText;e;)e=e(this)},t.QueryLexer.prototype.sliceString=function(){for(var e=[],n=this.start,r=this.pos,i=0;i<this.escapeCharPositions.length;i++)r=this.escapeCharPositions[i],e.push(this.str.slice(n,r)),n=r+1;return e.push(this.str.slice(n,this.pos)),this.escapeCharPositions.length=0,e.join("")},t.QueryLexer.prototype.emit=function(e){this.lexemes.push({type:e,str:this.sliceString(),start:this.start,end:this.pos}),this.start=this.pos},t.QueryLexer.prototype.escapeCharacter=function(){this.escapeCharPositions.push(this.pos-1),this.pos+=1},t.QueryLexer.prototype.next=function(){if(this.pos>=this.length)return t.QueryLexer.EOS;var e=this.str.charAt(this.pos);return this.pos+=1,e},t.QueryLexer.prototype.width=function(){return this.pos-this.start},t.QueryLexer.prototype.ignore=function(){this.start==this.pos&&(this.pos+=1),this.start=this.pos},t.QueryLexer.prototype.backup=function(){this.pos-=1},t.QueryLexer.prototype.acceptDigitRun=function(){var e,n;do e=this.next(),n=e.charCodeAt(0);while(n>47&&n<58);e!=t.QueryLexer.EOS&&this.backup()},t.QueryLexer.prototype.more=function(){return this.pos<this.length},t.QueryLexer.EOS="EOS",t.QueryLexer.FIELD="FIELD",t.QueryLexer.TERM="TERM",t.QueryLexer.EDIT_DISTANCE="EDIT_DISTANCE",t.QueryLexer.BOOST="BOOST",t.QueryLexer.PRESENCE="PRESENCE",t.QueryLexer.lexField=function(e){return e.backup(),e.emit(t.QueryLexer.FIELD),e.ignore(),t.QueryLexer.lexText},t.QueryLexer.lexTerm=function(e){if(e.width()>1&&(e.backup(),e.emit(t.QueryLexer.TERM)),e.ignore(),e.more())return t.QueryLexer.lexText},t.QueryLexer.lexEditDistance=function(e){return e.ignore(),e.acceptDigitRun(),e.emit(t.QueryLexer.EDIT_DISTANCE),t.QueryLexer.lexText},t.QueryLexer.lexBoost=function(e){return e.ignore(),e.acceptDigitRun(),e.emit(t.QueryLexer.BOOST),t.QueryLexer.lexText},t.QueryLexer.lexEOS=function(e){e.width()>0&&e.emit(t.QueryLexer.TERM)},t.QueryLexer.termSeparator=t.tokenizer.separator,t.QueryLexer.lexText=function(e){for(;;){var n=e.next();if(n==t.QueryLexer.EOS)return t.QueryLexer.lexEOS;if(n.charCodeAt(0)==92){e.escapeCharacter();continue}if(n==":")return t.QueryLexer.lexField;if(n=="~")return e.backup(),e.width()>0&&e.emit(t.QueryLexer.TERM),t.QueryLexer.lexEditDistance;if(n=="^")return e.backup(),e.width()>0&&e.emit(t.QueryLexer.TERM),t.QueryLexer.lexBoost;if(n=="+"&&e.width()===1||n=="-"&&e.width()===1)return e.emit(t.QueryLexer.PRESENCE),t.QueryLexer.lexText;if(n.match(t.QueryLexer.termSeparator))return t.QueryLexer.lexTerm}},t.QueryParser=function(e,n){this.lexer=new t.QueryLexer(e),this.query=n,this.currentClause={},this.lexemeIdx=0},t.QueryParser.prototype.parse=function(){this.lexer.run(),this.lexemes=this.lexer.lexemes;for(var e=t.QueryParser.parseClause;e;)e=e(this);return this.query},t.QueryParser.prototype.peekLexeme=function(){return this.lexemes[this.lexemeIdx]},t.QueryParser.prototype.consumeLexeme=function(){var e=this.peekLexeme();return this.lexemeIdx+=1,e},t.QueryParser.prototype.nextClause=function(){var e=this.currentClause;this.query.clause(e),this.currentClause={}},t.QueryParser.parseClause=function(e){var n=e.peekLexeme();if(n!=null)switch(n.type){case t.QueryLexer.PRESENCE:return t.QueryParser.parsePresence;case t.QueryLexer.FIELD:return t.QueryParser.parseField;case t.QueryLexer.TERM:return t.QueryParser.parseTerm;default:var r="expected either a field or a term, found "+n.type;throw n.str.length>=1&&(r+=" with value '"+n.str+"'"),new t.QueryParseError(r,n.start,n.end)}},t.QueryParser.parsePresence=function(e){var n=e.consumeLexeme();if(n!=null){switch(n.str){case"-":e.currentClause.presence=t.Query.presence.PROHIBITED;break;case"+":e.currentClause.presence=t.Query.presence.REQUIRED;break;default:var r="unrecognised presence operator'"+n.str+"'";throw new t.QueryParseError(r,n.start,n.end)}var i=e.peekLexeme();if(i==null){var r="expecting term or field, found nothing";throw new t.QueryParseError(r,n.start,n.end)}switch(i.type){case t.QueryLexer.FIELD:return t.QueryParser.parseField;case t.QueryLexer.TERM:return t.QueryParser.parseTerm;default:var r="expecting term or field, found '"+i.type+"'";throw new t.QueryParseError(r,i.start,i.end)}}},t.QueryParser.parseField=function(e){var n=e.consumeLexeme();if(n!=null){if(e.query.allFields.indexOf(n.str)==-1){var r=e.query.allFields.map(function(o){return"'"+o+"'"}).join(", "),i="unrecognised field '"+n.str+"', possible fields: "+r;throw new t.QueryParseError(i,n.start,n.end)}e.currentClause.fields=[n.str];var s=e.peekLexeme();if(s==null){var i="expecting term, found nothing";throw new t.QueryParseError(i,n.start,n.end)}switch(s.type){case t.QueryLexer.TERM:return t.QueryParser.parseTerm;default:var i="expecting term, found '"+s.type+"'";throw new t.QueryParseError(i,s.start,s.end)}}},t.QueryParser.parseTerm=function(e){var n=e.consumeLexeme();if(n!=null){e.currentClause.term=n.str.toLowerCase(),n.str.indexOf("*")!=-1&&(e.currentClause.usePipeline=!1);var r=e.peekLexeme();if(r==null){e.nextClause();return}switch(r.type){case t.QueryLexer.TERM:return e.nextClause(),t.QueryParser.parseTerm;case t.QueryLexer.FIELD:return e.nextClause(),t.QueryParser.parseField;case t.QueryLexer.EDIT_DISTANCE:return t.QueryParser.parseEditDistance;case t.QueryLexer.BOOST:return t.QueryParser.parseBoost;case t.QueryLexer.PRESENCE:return e.nextClause(),t.QueryParser.parsePresence;default:var i="Unexpected lexeme type '"+r.type+"'";throw new t.QueryParseError(i,r.start,r.end)}}},t.QueryParser.parseEditDistance=function(e){var n=e.consumeLexeme();if(n!=null){var r=parseInt(n.str,10);if(isNaN(r)){var i="edit distance must be numeric";throw new t.QueryParseError(i,n.start,n.end)}e.currentClause.editDistance=r;var s=e.peekLexeme();if(s==null){e.nextClause();return}switch(s.type){case t.QueryLexer.TERM:return e.nextClause(),t.QueryParser.parseTerm;case t.QueryLexer.FIELD:return e.nextClause(),t.QueryParser.parseField;case t.QueryLexer.EDIT_DISTANCE:return t.QueryParser.parseEditDistance;case t.QueryLexer.BOOST:return t.QueryParser.parseBoost;case t.QueryLexer.PRESENCE:return e.nextClause(),t.QueryParser.parsePresence;default:var i="Unexpected lexeme type '"+s.type+"'";throw new t.QueryParseError(i,s.start,s.end)}}},t.QueryParser.parseBoost=function(e){var n=e.consumeLexeme();if(n!=null){var r=parseInt(n.str,10);if(isNaN(r)){var i="boost must be numeric";throw new t.QueryParseError(i,n.start,n.end)}e.currentClause.boost=r;var s=e.peekLexeme();if(s==null){e.nextClause();return}switch(s.type){case t.QueryLexer.TERM:return e.nextClause(),t.QueryParser.parseTerm;case t.QueryLexer.FIELD:return e.nextClause(),t.QueryParser.parseField;case t.QueryLexer.EDIT_DISTANCE:return t.QueryParser.parseEditDistance;case t.QueryLexer.BOOST:return t.QueryParser.parseBoost;case t.QueryLexer.PRESENCE:return e.nextClause(),t.QueryParser.parsePresence;default:var i="Unexpected lexeme type '"+s.type+"'";throw new t.QueryParseError(i,s.start,s.end)}}},function(e,n){typeof define=="function"&&define.amd?define(n):typeof de=="object"?he.exports=n():e.lunr=n()}(this,function(){return t})})()});window.translations||={copy:"Copy",copied:"Copied!",normally_hidden:"This member is normally hidden due to your filter settings.",hierarchy_expand:"Expand",hierarchy_collapse:"Collapse",folder:"Folder",kind_1:"Project",kind_2:"Module",kind_4:"Namespace",kind_8:"Enumeration",kind_16:"Enumeration Member",kind_32:"Variable",kind_64:"Function",kind_128:"Class",kind_256:"Interface",kind_512:"Constructor",kind_1024:"Property",kind_2048:"Method",kind_4096:"Call Signature",kind_8192:"Index Signature",kind_16384:"Constructor Signature",kind_32768:"Parameter",kind_65536:"Type Literal",kind_131072:"Type Parameter",kind_262144:"Accessor",kind_524288:"Get Signature",kind_1048576:"Set Signature",kind_2097152:"Type Alias",kind_4194304:"Reference",kind_8388608:"Document"};var ce=[];function G(t,e){ce.push({selector:e,constructor:t})}var J=class{alwaysVisibleMember=null;constructor(){this.createComponents(document.body),this.ensureFocusedElementVisible(),this.listenForCodeCopies(),window.addEventListener("hashchange",()=>this.ensureFocusedElementVisible()),document.body.style.display||(this.ensureFocusedElementVisible(),this.updateIndexVisibility(),this.scrollToHash())}createComponents(e){ce.forEach(n=>{e.querySelectorAll(n.selector).forEach(r=>{r.dataset.hasInstance||(new n.constructor({el:r,app:this}),r.dataset.hasInstance=String(!0))})})}filterChanged(){this.ensureFocusedElementVisible()}showPage(){document.body.style.display&&(document.body.style.removeProperty("display"),this.ensureFocusedElementVisible(),this.updateIndexVisibility(),this.scrollToHash())}scrollToHash(){if(location.hash){let e=document.getElementById(location.hash.substring(1));if(!e)return;e.scrollIntoView({behavior:"instant",block:"start"})}}ensureActivePageVisible(){let e=document.querySelector(".tsd-navigation .current"),n=e?.parentElement;for(;n&&!n.classList.contains(".tsd-navigation");)n instanceof HTMLDetailsElement&&(n.open=!0),n=n.parentElement;if(e&&!ze(e)){let r=e.getBoundingClientRect().top-document.documentElement.clientHeight/4;document.querySelector(".site-menu").scrollTop=r,document.querySelector(".col-sidebar").scrollTop=r}}updateIndexVisibility(){let e=document.querySelector(".tsd-index-content"),n=e?.open;e&&(e.open=!0),document.querySelectorAll(".tsd-index-section").forEach(r=>{r.style.display="block";let i=Array.from(r.querySelectorAll(".tsd-index-link")).every(s=>s.offsetParent==null);r.style.display=i?"none":"block"}),e&&(e.open=n)}ensureFocusedElementVisible(){if(this.alwaysVisibleMember&&(this.alwaysVisibleMember.classList.remove("always-visible"),this.alwaysVisibleMember.firstElementChild.remove(),this.alwaysVisibleMember=null),!location.hash)return;let e=document.getElementById(location.hash.substring(1));if(!e)return;let n=e.parentElement;for(;n&&n.tagName!=="SECTION";)n=n.parentElement;if(!n)return;let r=n.offsetParent==null,i=n;for(;i!==document.body;)i instanceof HTMLDetailsElement&&(i.open=!0),i=i.parentElement;if(n.offsetParent==null){this.alwaysVisibleMember=n,n.classList.add("always-visible");let s=document.createElement("p");s.classList.add("warning"),s.textContent=window.translations.normally_hidden,n.prepend(s)}r&&e.scrollIntoView()}listenForCodeCopies(){document.querySelectorAll("pre > button").forEach(e=>{let n;e.addEventListener("click",()=>{e.previousElementSibling instanceof HTMLElement&&navigator.clipboard.writeText(e.previousElementSibling.innerText.trim()),e.textContent=window.translations.copied,e.classList.add("visible"),clearTimeout(n),n=setTimeout(()=>{e.classList.remove("visible"),n=setTimeout(()=>{e.textContent=window.translations.copy},100)},1e3)})})}};function ze(t){let e=t.getBoundingClientRect(),n=Math.max(document.documentElement.clientHeight,window.innerHeight);return!(e.bottom<0||e.top-n>=0)}var ue=(t,e=100)=>{let n;return()=>{clearTimeout(n),n=setTimeout(()=>t(),e)}};var ge=$e(pe(),1);async function A(t){let e=Uint8Array.from(atob(t),s=>s.charCodeAt(0)),r=new Blob([e]).stream().pipeThrough(new DecompressionStream("deflate")),i=await new Response(r).text();return JSON.parse(i)}async function fe(t,e){if(!window.searchData)return;let n=await A(window.searchData);t.data=n,t.index=ge.Index.load(n.index),e.classList.remove("loading"),e.classList.add("ready")}function ve(){let t=document.getElementById("tsd-search");if(!t)return;let e={base:document.documentElement.dataset.base+"/"},n=document.getElementById("tsd-search-script");t.classList.add("loading"),n&&(n.addEventListener("error",()=>{t.classList.remove("loading"),t.classList.add("failure")}),n.addEventListener("load",()=>{fe(e,t)}),fe(e,t));let r=document.querySelector("#tsd-search input"),i=document.querySelector("#tsd-search .results");if(!r||!i)throw new Error("The input field or the result list wrapper was not found");i.addEventListener("mouseup",()=>{re(t)}),r.addEventListener("focus",()=>t.classList.add("has-focus")),We(t,i,r,e)}function We(t,e,n,r){n.addEventListener("input",ue(()=>{Ue(t,e,n,r)},200)),n.addEventListener("keydown",i=>{i.key=="Enter"?Je(e,t):i.key=="ArrowUp"?(me(e,n,-1),i.preventDefault()):i.key==="ArrowDown"&&(me(e,n,1),i.preventDefault())}),document.body.addEventListener("keypress",i=>{i.altKey||i.ctrlKey||i.metaKey||!n.matches(":focus")&&i.key==="/"&&(i.preventDefault(),n.focus())}),document.body.addEventListener("keyup",i=>{t.classList.contains("has-focus")&&(i.key==="Escape"||!e.matches(":focus-within")&&!n.matches(":focus"))&&(n.blur(),re(t))})}function re(t){t.classList.remove("has-focus")}function Ue(t,e,n,r){if(!r.index||!r.data)return;e.textContent="";let i=n.value.trim(),s;if(i){let o=i.split(" ").map(a=>a.length?`*${a}*`:"").join(" ");s=r.index.search(o)}else s=[];for(let o=0;o<s.length;o++){let a=s[o],l=r.data.rows[Number(a.ref)],c=1;l.name.toLowerCase().startsWith(i.toLowerCase())&&(c*=1+1/(1+Math.abs(l.name.length-i.length))),a.score*=c}if(s.length===0){let o=document.createElement("li");o.classList.add("no-results");let a=document.createElement("span");a.textContent="No results found",o.appendChild(a),e.appendChild(o)}s.sort((o,a)=>a.score-o.score);for(let o=0,a=Math.min(10,s.length);o<a;o++){let l=r.data.rows[Number(s[o].ref)],c=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon"><use href="#icon-${l.kind}"></use></svg>`,d=ye(l.name,i);globalThis.DEBUG_SEARCH_WEIGHTS&&(d+=` (score: ${s[o].score.toFixed(2)})`),l.parent&&(d=`<span class="parent">
                ${ye(l.parent,i)}.</span>${d}`);let m=document.createElement("li");m.classList.value=l.classes??"";let p=document.createElement("a");p.href=r.base+l.url,p.innerHTML=c+d,m.append(p),p.addEventListener("focus",()=>{e.querySelector(".current")?.classList.remove("current"),m.classList.add("current")}),e.appendChild(m)}}function me(t,e,n){let r=t.querySelector(".current");if(!r)r=t.querySelector(n==1?"li:first-child":"li:last-child"),r&&r.classList.add("current");else{let i=r;if(n===1)do i=i.nextElementSibling??void 0;while(i instanceof HTMLElement&&i.offsetParent==null);else do i=i.previousElementSibling??void 0;while(i instanceof HTMLElement&&i.offsetParent==null);i?(r.classList.remove("current"),i.classList.add("current")):n===-1&&(r.classList.remove("current"),e.focus())}}function Je(t,e){let n=t.querySelector(".current");if(n||(n=t.querySelector("li:first-child")),n){let r=n.querySelector("a");r&&(window.location.href=r.href),re(e)}}function ye(t,e){if(e==="")return t;let n=t.toLocaleLowerCase(),r=e.toLocaleLowerCase(),i=[],s=0,o=n.indexOf(r);for(;o!=-1;)i.push(ne(t.substring(s,o)),`<b>${ne(t.substring(o,o+r.length))}</b>`),s=o+r.length,o=n.indexOf(r,s);return i.push(ne(t.substring(s))),i.join("")}var Ge={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"};function ne(t){return t.replace(/[&<>"'"]/g,e=>Ge[e])}var I=class{el;app;constructor(e){this.el=e.el,this.app=e.app}};var H="mousedown",Ee="mousemove",B="mouseup",X={x:0,y:0},xe=!1,ie=!1,Xe=!1,D=!1,be=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);document.documentElement.classList.add(be?"is-mobile":"not-mobile");be&&"ontouchstart"in document.documentElement&&(Xe=!0,H="touchstart",Ee="touchmove",B="touchend");document.addEventListener(H,t=>{ie=!0,D=!1;let e=H=="touchstart"?t.targetTouches[0]:t;X.y=e.pageY||0,X.x=e.pageX||0});document.addEventListener(Ee,t=>{if(ie&&!D){let e=H=="touchstart"?t.targetTouches[0]:t,n=X.x-(e.pageX||0),r=X.y-(e.pageY||0);D=Math.sqrt(n*n+r*r)>10}});document.addEventListener(B,()=>{ie=!1});document.addEventListener("click",t=>{xe&&(t.preventDefault(),t.stopImmediatePropagation(),xe=!1)});var Y=class extends I{active;className;constructor(e){super(e),this.className=this.el.dataset.toggle||"",this.el.addEventListener(B,n=>this.onPointerUp(n)),this.el.addEventListener("click",n=>n.preventDefault()),document.addEventListener(H,n=>this.onDocumentPointerDown(n)),document.addEventListener(B,n=>this.onDocumentPointerUp(n))}setActive(e){if(this.active==e)return;this.active=e,document.documentElement.classList.toggle("has-"+this.className,e),this.el.classList.toggle("active",e);let n=(this.active?"to-has-":"from-has-")+this.className;document.documentElement.classList.add(n),setTimeout(()=>document.documentElement.classList.remove(n),500)}onPointerUp(e){D||(this.setActive(!0),e.preventDefault())}onDocumentPointerDown(e){if(this.active){if(e.target.closest(".col-sidebar, .tsd-filter-group"))return;this.setActive(!1)}}onDocumentPointerUp(e){if(!D&&this.active&&e.target.closest(".col-sidebar")){let n=e.target.closest("a");if(n){let r=window.location.href;r.indexOf("#")!=-1&&(r=r.substring(0,r.indexOf("#"))),n.href.substring(0,r.length)==r&&setTimeout(()=>this.setActive(!1),250)}}}};var se;try{se=localStorage}catch{se={getItem(){return null},setItem(){}}}var C=se;var Le=document.head.appendChild(document.createElement("style"));Le.dataset.for="filters";var Z=class extends I{key;value;constructor(e){super(e),this.key=`filter-${this.el.name}`,this.value=this.el.checked,this.el.addEventListener("change",()=>{this.setLocalStorage(this.el.checked)}),this.setLocalStorage(this.fromLocalStorage()),Le.innerHTML+=`html:not(.${this.key}) .tsd-is-${this.el.name} { display: none; }
`,this.app.updateIndexVisibility()}fromLocalStorage(){let e=C.getItem(this.key);return e?e==="true":this.el.checked}setLocalStorage(e){C.setItem(this.key,e.toString()),this.value=e,this.handleValueChange()}handleValueChange(){this.el.checked=this.value,document.documentElement.classList.toggle(this.key,this.value),this.app.filterChanged(),this.app.updateIndexVisibility()}};var oe=new Map,ae=class{open;accordions=[];key;constructor(e,n){this.key=e,this.open=n}add(e){this.accordions.push(e),e.open=this.open,e.addEventListener("toggle",()=>{this.toggle(e.open)})}toggle(e){for(let n of this.accordions)n.open=e;C.setItem(this.key,e.toString())}},K=class extends I{constructor(e){super(e);let n=this.el.querySelector("summary"),r=n.querySelector("a");r&&r.addEventListener("click",()=>{location.assign(r.href)});let i=`tsd-accordion-${n.dataset.key??n.textContent.trim().replace(/\s+/g,"-").toLowerCase()}`,s;if(oe.has(i))s=oe.get(i);else{let o=C.getItem(i),a=o?o==="true":this.el.open;s=new ae(i,a),oe.set(i,s)}s.add(this.el)}};function Se(t){let e=C.getItem("tsd-theme")||"os";t.value=e,we(e),t.addEventListener("change",()=>{C.setItem("tsd-theme",t.value),we(t.value)})}function we(t){document.documentElement.dataset.theme=t}var ee;function Ce(){let t=document.getElementById("tsd-nav-script");t&&(t.addEventListener("load",Te),Te())}async function Te(){let t=document.getElementById("tsd-nav-container");if(!t||!window.navigationData)return;let e=await A(window.navigationData);ee=document.documentElement.dataset.base,ee.endsWith("/")||(ee+="/"),t.innerHTML="";for(let n of e)Ie(n,t,[]);window.app.createComponents(t),window.app.showPage(),window.app.ensureActivePageVisible()}function Ie(t,e,n){let r=e.appendChild(document.createElement("li"));if(t.children){let i=[...n,t.text],s=r.appendChild(document.createElement("details"));s.className=t.class?`${t.class} tsd-accordion`:"tsd-accordion";let o=s.appendChild(document.createElement("summary"));o.className="tsd-accordion-summary",o.dataset.key=i.join("$"),o.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><use href="#icon-chevronDown"></use></svg>',ke(t,o);let a=s.appendChild(document.createElement("div"));a.className="tsd-accordion-details";let l=a.appendChild(document.createElement("ul"));l.className="tsd-nested-navigation";for(let c of t.children)Ie(c,l,i)}else ke(t,r,t.class)}function ke(t,e,n){if(t.path){let r=e.appendChild(document.createElement("a"));if(r.href=ee+t.path,n&&(r.className=n),location.pathname===r.pathname&&!r.href.includes("#")&&r.classList.add("current"),t.kind){let i=window.translations[`kind_${t.kind}`].replaceAll('"',"&quot;");r.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon" aria-label="${i}"><use href="#icon-${t.kind}"></use></svg>`}r.appendChild(document.createElement("span")).textContent=t.text}else{let r=e.appendChild(document.createElement("span")),i=window.translations.folder.replaceAll('"',"&quot;");r.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon" aria-label="${i}"><use href="#icon-folder"></use></svg>`,r.appendChild(document.createElement("span")).textContent=t.text}}var te=document.documentElement.dataset.base;te.endsWith("/")||(te+="/");function Pe(){document.querySelector(".tsd-full-hierarchy")?Ye():document.querySelector(".tsd-hierarchy")&&Ze()}function Ye(){document.addEventListener("click",r=>{let i=r.target;for(;i.parentElement&&i.parentElement.tagName!="LI";)i=i.parentElement;i.dataset.dropdown&&(i.dataset.dropdown=String(i.dataset.dropdown!=="true"))});let t=new Map,e=new Set;for(let r of document.querySelectorAll(".tsd-full-hierarchy [data-refl]")){let i=r.querySelector("ul");t.has(r.dataset.refl)?e.add(r.dataset.refl):i&&t.set(r.dataset.refl,i)}for(let r of e)n(r);function n(r){let i=t.get(r).cloneNode(!0);i.querySelectorAll("[id]").forEach(s=>{s.removeAttribute("id")}),i.querySelectorAll("[data-dropdown]").forEach(s=>{s.dataset.dropdown="false"});for(let s of document.querySelectorAll(`[data-refl="${r}"]`)){let o=tt(),a=s.querySelector("ul");s.insertBefore(o,a),o.dataset.dropdown=String(!!a),a||s.appendChild(i.cloneNode(!0))}}}function Ze(){let t=document.getElementById("tsd-hierarchy-script");t&&(t.addEventListener("load",Qe),Qe())}async function Qe(){let t=document.querySelector(".tsd-panel.tsd-hierarchy:has(h4 a)");if(!t||!window.hierarchyData)return;let e=+t.dataset.refl,n=await A(window.hierarchyData),r=t.querySelector("ul"),i=document.createElement("ul");if(i.classList.add("tsd-hierarchy"),Ke(i,n,e),r.querySelectorAll("li").length==i.querySelectorAll("li").length)return;let s=document.createElement("span");s.classList.add("tsd-hierarchy-toggle"),s.textContent=window.translations.hierarchy_expand,t.querySelector("h4 a")?.insertAdjacentElement("afterend",s),s.insertAdjacentText("beforebegin",", "),s.addEventListener("click",()=>{s.textContent===window.translations.hierarchy_expand?(r.insertAdjacentElement("afterend",i),r.remove(),s.textContent=window.translations.hierarchy_collapse):(i.insertAdjacentElement("afterend",r),i.remove(),s.textContent=window.translations.hierarchy_expand)})}function Ke(t,e,n){let r=e.roots.filter(i=>et(e,i,n));for(let i of r)t.appendChild(_e(e,i,n))}function _e(t,e,n,r=new Set){if(r.has(e))return;r.add(e);let i=t.reflections[e],s=document.createElement("li");if(s.classList.add("tsd-hierarchy-item"),e===n){let o=s.appendChild(document.createElement("span"));o.textContent=i.name,o.classList.add("tsd-hierarchy-target")}else{for(let a of i.uniqueNameParents||[]){let l=t.reflections[a],c=s.appendChild(document.createElement("a"));c.textContent=l.name,c.href=te+l.url,c.className=l.class+" tsd-signature-type",s.append(document.createTextNode("."))}let o=s.appendChild(document.createElement("a"));o.textContent=t.reflections[e].name,o.href=te+i.url,o.className=i.class+" tsd-signature-type"}if(i.children){let o=s.appendChild(document.createElement("ul"));o.classList.add("tsd-hierarchy");for(let a of i.children){let l=_e(t,a,n,r);l&&o.appendChild(l)}}return r.delete(e),s}function et(t,e,n){if(e===n)return!0;let r=new Set,i=[t.reflections[e]];for(;i.length;){let s=i.pop();if(!r.has(s)){r.add(s);for(let o of s.children||[]){if(o===n)return!0;i.push(t.reflections[o])}}}return!1}function tt(){let t=document.createElementNS("http://www.w3.org/2000/svg","svg");return t.setAttribute("width","20"),t.setAttribute("height","20"),t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","none"),t.innerHTML='<use href="#icon-chevronDown"></use>',t}G(Y,"a[data-toggle]");G(K,".tsd-accordion");G(Z,".tsd-filter-item input[type=checkbox]");var Oe=document.getElementById("tsd-theme");Oe&&Se(Oe);var nt=new J;Object.defineProperty(window,"app",{value:nt});ve();Ce();Pe();})();
/*! Bundled license information:

lunr/lunr.js:
  (**
   * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.9
   * Copyright (C) 2020 Oliver Nightingale
   * @license MIT
   *)
  (*!
   * lunr.utils
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Set
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.tokenizer
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Pipeline
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Vector
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.stemmer
   * Copyright (C) 2020 Oliver Nightingale
   * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
   *)
  (*!
   * lunr.stopWordFilter
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.trimmer
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.TokenSet
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Index
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Builder
   * Copyright (C) 2020 Oliver Nightingale
   *)
*/



================================================
File: docs/assets/navigation.js
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

window.navigationData = "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"


================================================
File: docs/assets/search.js
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

window.searchData = "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";









================================================
File: scripts/add_docsite_license_headers.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';

const header = `/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

`;

function addHeader(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, header + content);
}

function processDirectory(directory: string) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.js')) {
      addHeader(filePath);
    }
  }
}

const docsDir = path.join(__dirname, '..', 'docs');
processDirectory(docsDir);



================================================
File: scripts/validate_api_consistency.sh
================================================
#!/bin/bash


# Define the file paths
crossplatform="api-report/genai.api.md"
node="api-report/genai-node.api.md"
web="api-report/genai-web.api.md"


diff1=$(diff "$crossplatform" "$node")

diff2=$(diff "$crossplatform" "$web")

if [ -n "$diff1" ] || [ -n "$diff2" ]; then
  echo "The crossplatform, web, and node APIs must be consistent, found the following difference:"
  if [ -n "$diff1" ]; then
    echo "Difference between $crossplatform and $node:"
    echo "$diff1"
  fi
  if [ -n "$diff2" ]; then
    echo "Difference between $crossplatform and $web:"
    echo "$diff2"
  fi
  exit 1
else
  echo "The API files are identical."
  exit 0
fi



================================================
File: sdk-samples/README.md
================================================
# Usage samples for `@google/genai/node`

To run the samples first build the SDK and the samples, from the repository root:

```sh
# Build the SDK
npm install
npm run build

# Build the samples
cd sdk-samples
npm install
npm run build
```

The samples use key and project settings from environment variables, set the following environment variables prior to invoking samples:

```sh
export GEMINI_API_KEY=<GEMINI_KEY>
export GOOGLE_CLOUD_PROJECT=<GOOGLE_CLOUD_PROJECT>
export GOOGLE_CLOUD_LOCATION=<GCP_REGION>
```

Now you can run the compiled samples, e.g:

```sh
node build/generate_content_with_text.js
```



================================================
File: sdk-samples/caches.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, Part} from '@google/genai';

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function createCacheFromMLDev() {
  // TODO: b/377544962 - Add example after file upload is supported.
}

async function createCacheFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const cachedContent1: Part = {
    fileData: {
      fileUri: 'gs://cloud-samples-data/generative-ai/pdf/2403.05530.pdf',
      mimeType: 'application/pdf',
    },
  };

  const cachedContent2: Part = {
    fileData: {
      fileUri: 'gs://cloud-samples-data/generative-ai/pdf/2312.11805v3.pdf',
      mimeType: 'application/pdf',
    },
  };

  const cache = await ai.caches.create({
    model: 'gemini-1.5-pro-002',
    config: {contents: [cachedContent1, cachedContent2]},
  });

  console.debug(JSON.stringify(cache));
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await createCacheFromVertexAI().catch((e) => console.error('got error', e));
  } else {
    await createCacheFromMLDev().catch((e) => console.error('got error', e));
  }
}

main();



================================================
File: sdk-samples/chats.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function createChatFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const chat = ai.chats.create({model: 'gemini-2.0-flash'});

  const response = await chat.sendMessage({message: 'Why is the sky blue?'});
  console.debug('chat response 1: ', response.text);
  const response2 = await chat.sendMessage({message: 'Why is the sunset red?'});
  console.debug('chat response 2: ', response2.text);

  const history = chat.getHistory();
  for (const content of history) {
    console.debug('chat history: ', JSON.stringify(content, null, 2));
  }
}

async function createChatStreamFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});
  const chat = ai.chats.create({model: 'gemini-2.0-flash'});
  const response = await chat.sendMessageStream({
    message: 'Why is the sky blue?',
  });
  for await (const chunk of response) {
    console.debug('chat response 1 chunk: ', chunk.text);
  }
  const response2 = await chat.sendMessageStream({
    message: 'Why is the sunset red?',
  });
  for await (const chunk of response2) {
    console.debug('chat response 2 chunk: ', chunk.text);
  }
  const history = chat.getHistory();
  for (const content of history) {
    console.debug('chat history: ', JSON.stringify(content, null, 2));
  }
}

async function createChatFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const chat = ai.chats.create({model: 'gemini-2.0-flash'});

  const response = await chat.sendMessage({message: 'Why is the sky blue?'});
  console.debug('chat response 1: ', response.text);
  const response2 = await chat.sendMessage({message: 'Why is the sunset red?'});
  console.debug('chat response 2: ', response2.text);

  const history = chat.getHistory();
  for (const content of history) {
    console.debug('chat history: ', JSON.stringify(content, null, 2));
  }
}

async function createChatStreamFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });
  const chat = ai.chats.create({model: 'gemini-2.0-flash'});
  const response = await chat.sendMessageStream({
    message: 'Why is the sky blue?',
  });
  for await (const chunk of response) {
    console.debug('chat response 1 chunk: ', chunk.text);
  }
  const response2 = await chat.sendMessageStream({
    message: 'Why is the sunset red?',
  });
  for await (const chunk of response2) {
    console.debug('chat response 2 chunk: ', chunk.text);
  }
  const history = chat.getHistory();
  for (const content of history) {
    console.debug('chat history: ', JSON.stringify(content, null, 2));
  }
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await createChatFromVertexAI().catch((e) => console.error('got error', e));
    await createChatStreamFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await createChatFromMLDev().catch((e) => console.error('got error', e));
    await createChatStreamFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/count_tokens.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function countTokensFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const response = await ai.models.countTokens({
    model: 'gemini-2.0-flash',
    contents: 'The quick brown fox jumps over the lazy dog.',
  });

  console.debug(JSON.stringify(response));
}

async function countTokensFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const response = await ai.models.countTokens({
    model: 'gemini-2.0-flash',
    contents: 'The quick brown fox jumps over the lazy dog.',
  });

  console.debug(JSON.stringify(response));
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await countTokensFromVertexAI().catch((e) => console.error('got error', e));
  } else {
    await countTokensFromMLDev().catch((e) => console.error('got error', e));
  }
}

main();



================================================
File: sdk-samples/embed_content.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function embedContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: 'Hello world!',
  });

  console.debug(JSON.stringify(response));
}

async function embedContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: 'Hello world!',
  });

  console.debug(JSON.stringify(response));
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await embedContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await embedContentFromMLDev().catch((e) => console.error('got error', e));
  }
}

main();



================================================
File: sdk-samples/generate_content_with_code_execution.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents:
      'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.',
    config: {
      tools: [{codeExecution: {}}],
    },
  });

  console.debug(response.executableCode);
  console.debug(response.codeExecutionResult);
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents:
      'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.',
    config: {
      tools: [{codeExecution: {}}],
    },
  });

  console.debug(response.executableCode);
  console.debug(response.codeExecutionResult);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_file_upload.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {ContentListUnion, createPartFromUri, GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromFileUploadMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});
  const testFile = new Blob(
    [
      'The Whispering Woods In the heart of Eldergrove, there stood a forest whispered about by the villagers. They spoke of trees that could talk and streams that sang. Young Elara, curious and adventurous, decided to explore the woods one crisp autumn morning. As she wandered deeper, the leaves rustled with excitement, revealing hidden paths. Elara noticed the trees bending slightly as if beckoning her to come closer. When she paused to listen, she heard soft murmurs—stories of lost treasures and forgotten dreams. Drawn by the enchanting sounds, she followed a narrow trail until she stumbled upon a shimmering pond. At its edge, a wise old willow tree spoke, “Child of the village, what do you seek?” “I seek adventure,” Elara replied, her heart racing. “Adventure lies not in faraway lands but within your spirit,” the willow said, swaying gently. “Every choice you make is a step into the unknown.” With newfound courage, Elara left the woods, her mind buzzing with possibilities. The villagers would say the woods were magical, but to Elara, it was the spark of her imagination that had transformed her ordinary world into a realm of endless adventures. She smiled, knowing her journey was just beginning',
    ],
    {type: 'text/plain'},
  );

  // Upload the file.
  const file = await ai.files.upload({
    file: testFile,
    config: {
      displayName: 'generate_file.txt',
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({name: file.name as string});
  while (getFile.state === 'PROCESSING') {
    getFile = await ai.files.get({name: file.name as string});
    console.log(`current file status: ${getFile.state}`);
    console.log('File is still processing, retrying in 5 seconds');

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
  if (file.state === 'FAILED') {
    throw new Error('File processing failed.');
  }

  // Add the file to the contents.
  const content: ContentListUnion = [
    'Summarize the story in a single sentence.',
  ];

  if (file.uri && file.mimeType) {
    const fileContent = createPartFromUri(file.uri, file.mimeType);
    content.push(fileContent);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: content,
  });

  console.debug(response.text);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    throw new Error('Vertex AI is not supported for this sample.');
  } else {
    await generateContentFromFileUploadMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_function_calling.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  FunctionCallingConfigMode,
  FunctionDeclaration,
  GoogleGenAI,
  Type,
} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const controlLightFunctionDeclaration: FunctionDeclaration = {
    name: 'controlLight',
    parameters: {
      type: Type.OBJECT,
      description: 'Set the brightness and color temperature of a room light.',
      properties: {
        brightness: {
          type: Type.NUMBER,
          description:
            'Light level from 0 to 100. Zero is off and 100 is full brightness.',
        },
        colorTemperature: {
          type: Type.STRING,
          description:
            'Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.',
        },
      },
      required: ['brightness', 'colorTemperature'],
    },
  };
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Dim the lights so the room feels cozy and warm.',
    config: {
      tools: [{functionDeclarations: [controlLightFunctionDeclaration]}],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['controlLight'],
        },
      },
    },
  });

  console.debug(response.functionCalls);
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const controlLightFunctionDeclaration: FunctionDeclaration = {
    name: 'controlLight',
    parameters: {
      type: Type.OBJECT,
      description: 'Set the brightness and color temperature of a room light.',
      properties: {
        brightness: {
          type: Type.NUMBER,
          description:
            'Light level from 0 to 100. Zero is off and 100 is full brightness.',
        },
        colorTemperature: {
          type: Type.STRING,
          description:
            'Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.',
        },
      },
      required: ['brightness', 'colorTemperature'],
    },
  };
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Dim the lights so the room feels cozy and warm.',
    config: {
      tools: [{functionDeclarations: [controlLightFunctionDeclaration]}],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['controlLight'],
        },
      },
    },
  });

  console.debug(response.functionCalls);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_log_prob.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const response = await ai.models.generateContent({
    // Only 002 models + flash 1.5 8b models are enabled with log probs option.
    model: 'gemini-1.5-flash-002',
    contents: 'Hello!',
    config: {
      responseLogprobs: true,
    },
  });

  console.debug(JSON.stringify(response));
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const response = await ai.models.generateContent({
    // Only 002 models + flash 1.5 8b models are enabled with log probs option.
    model: 'gemini-1.5-flash-002',
    contents: 'Hello!',
    config: {
      responseLogprobs: true,
    },
  });

  console.debug(JSON.stringify(response));
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_model_configuration.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Tell me a story about a magic backpack.',
    config: {
      candidateCount: 1,
      stopSequences: ['x'],
      maxOutputTokens: 20,
      temperature: 1.0,
    },
  });

  console.debug(response.text);
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Tell me a story about a magic backpack.',
    config: {
      candidateCount: 1,
      stopSequences: ['x'],
      maxOutputTokens: 20,
      temperature: 1.0,
    },
  });

  console.debug(response.text);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_response_schema.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, Type} from '@google/genai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GOOGLE_API_KEY});

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'List 3 popular cookie recipes.',
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            'recipeName': {
              type: Type.STRING,
              description: 'Name of the recipe',
              nullable: false,
            },
          },
          required: ['recipeName'],
        },
      },
    },
  });

  console.debug(response.text);
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'List 3 popular cookie recipes.',
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            'recipeName': {
              type: Type.STRING,
              description: 'Name of the recipe',
              nullable: false,
            },
          },
          required: ['recipeName'],
        },
      },
    },
  });

  console.debug(response.text);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_safety_settings.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  GoogleGenAI,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'say something bad',
    config: {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    },
  });
  console.debug(JSON.stringify(response?.candidates?.[0]?.safetyRatings));
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'say something bad',
    config: {
      safetySettings: [
        {
          method: HarmBlockMethod.SEVERITY,
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          method: HarmBlockMethod.SEVERITY,
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    },
  });
  console.debug(JSON.stringify(response?.candidates?.[0]?.safetyRatings));
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_search_grounding.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents:
      'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.',
    config: {
      tools: [{googleSearch: {}}],
    },
  });
  console.debug(JSON.stringify(response?.candidates?.[0]?.groundingMetadata));
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents:
      'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.',
    config: {
      tools: [{googleSearch: {}}],
    },
  });
  console.debug(JSON.stringify(response?.candidates?.[0]?.groundingMetadata));
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_system_instructions.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'high',
    config: {systemInstruction: 'I say high you say low.'},
  });
  console.debug(response.text);
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'high',
    config: {systemInstruction: 'I say high you say low.'},
  });
  console.debug(response.text);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_text.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'why is the sky blue?',
  });
  console.debug(response.text);
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'why is the sky blue?',
  });
  console.debug(response.text);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/generate_content_with_text_vertex_apikey.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    apiKey: GOOGLE_API_KEY,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: 'why is the sky blue?',
  });
  console.debug(response.text);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    console.log('Test is for Vertex AI API key only.');
  }
}

main();



================================================
File: sdk-samples/generate_image.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function generateContentFromMLDev() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: 'Robot holding a red skateboard',
    config: {
      numberOfImages: 1,
      includeRaiReason: true,
    },
  });

  console.debug(response?.generatedImages?.[0]?.image?.imageBytes);
}

async function generateContentFromVertexAI() {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  });
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: 'Robot holding a red skateboard',
    config: {
      numberOfImages: 1,
      includeRaiReason: true,
    },
  });

  console.debug(response?.generatedImages?.[0]?.image?.imageBytes);
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    await generateContentFromVertexAI().catch((e) =>
      console.error('got error', e),
    );
  } else {
    await generateContentFromMLDev().catch((e) =>
      console.error('got error', e),
    );
  }
}

main();



================================================
File: sdk-samples/live_client_content.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, LiveServerMessage, Modality} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

async function live(client: GoogleGenAI) {
  const responseQueue: LiveServerMessage[] = [];

  // This should use an async queue.
  async function waitMessage(): Promise<LiveServerMessage> {
    let done = false;
    let message: LiveServerMessage | undefined = undefined;
    while (!done) {
      message = responseQueue.shift();
      if (message) {
        console.debug('Received: %s\n', JSON.stringify(message, null, 4));
        done = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return message!;
  }

  async function handleTurn(): Promise<LiveServerMessage[]> {
    const turn: LiveServerMessage[] = [];
    let done = false;
    while (!done) {
      const message = await waitMessage();
      turn.push(message);
      if (message.serverContent && message.serverContent.turnComplete) {
        done = true;
      }
    }
    return turn;
  }

  const session = await client.live.connect({
    model: 'gemini-2.0-flash-exp',
    callbacks: {
      onopen: function () {
        console.debug('Opened');
      },
      onmessage: function (message: LiveServerMessage) {
        responseQueue.push(message);
      },
      onerror: function (e: ErrorEvent) {
        console.debug('Error:', e.message);
      },
      onclose: function (e: CloseEvent) {
        console.debug('Close:', e.reason);
      },
    },
    config: {responseModalities: [Modality.TEXT]},
  });

  const simple = 'Hello world';
  console.log('-'.repeat(80));
  console.log(`Sent: ${simple}`);
  session.sendClientContent({turns: simple});

  await handleTurn();

  const turns = [
    'This image is just black, can you see it?',
    {
      inlineData: {
        // 2x2 black PNG, base64 encoded.
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAC0lEQVR4nGNgQAYAAA4AAamRc7EAAAAASUVORK5CYII=',
        mimeType: 'image/png',
      },
    },
  ];
  console.log('-'.repeat(80));
  console.log(`Sent: ${turns}`);
  session.sendClientContent({turns: turns});

  await handleTurn();

  session.close();
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    const client = new GoogleGenAI({
      vertexai: true,
      project: GOOGLE_CLOUD_PROJECT,
      location: GOOGLE_CLOUD_LOCATION,
    });
    await live(client).catch((e) => console.error('got error', e));
  } else {
    const client = new GoogleGenAI({
      vertexai: false,
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        apiVersion: 'v1alpha',
      },
    });
    await live(client).catch((e) => console.error('got error', e));
  }
}

main();



================================================
File: sdk-samples/live_server.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint no-constant-condition: 0 */
/* eslint @typescript-eslint/no-require-imports: 0 */

import * as types from '@google/genai';
import {GoogleGenAI} from '@google/genai';

import type {Request, Response} from 'express'; // Import types only
import express from 'express';

import cors from 'cors';
import http from 'http';
import path from 'path';
import {Server, Socket} from 'socket.io';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

export function createBlob(audioData: string): types.Blob {
  return {data: audioData, mimeType: 'audio/pcm;rate=16000'};
}

export function debug(data: object): string {
  return JSON.stringify(data);
}

async function main() {
  let options: types.GoogleGenAIOptions;
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    options = {
      // Vertex AI
      vertexai: true,
      project: GOOGLE_CLOUD_PROJECT,
      location: GOOGLE_CLOUD_LOCATION,
    };
  } else {
    options = {
      // Google AI
      vertexai: false,
      apiKey: GOOGLE_API_KEY,
      httpOptions: {
        apiVersion: 'v1alpha',
      },
    };
  }
  const ai = new GoogleGenAI(options);
  const session = await ai.live.connect({
    model: 'gemini-2.0-flash-exp',
    callbacks: {
      onopen: () => {
        console.log('Live Session Opened');
      },
      onmessage: (message: types.LiveServerMessage) => {
        console.log('Received message from the server: %s\n', debug(message));
        if (
          message.serverContent &&
          message.serverContent.modelTurn &&
          message.serverContent.modelTurn.parts &&
          message.serverContent.modelTurn.parts.length > 0 &&
          message.serverContent.modelTurn.parts[0].inlineData &&
          message.serverContent.modelTurn.parts[0].inlineData.data
        ) {
          io.emit(
            'audioStream',
            message.serverContent.modelTurn.parts[0].inlineData.data,
          );
        }
      },
      onerror: (e: ErrorEvent) => {
        console.log('Live Session Error:', debug(e));
      },
      onclose: (e: CloseEvent) => {
        console.log('Live Session Closed:', debug(e));
      },
    },
  });

  const app = express();
  app.use(cors({origin: true}));
  const server = http.createServer(app);
  const io = new Server(server);

  app.get('/', function (req: Request, res: Response) {
    res.sendFile(path.join(process.cwd(), 'index.html'));
  });

  // Handle new connections to the socket.
  await io.on('connection', async function (socket: Socket) {
    console.log('Connected to the socket.');

    // Handle incoming content updates.`
    socket.on('contentUpdateText', function (text: string) {
      session.sendClientContent({turns: text, turnComplete: true});
    });

    // Handle incoming realtime audio input.
    socket.on('realtimeInput', function (audioData: string) {
      session.sendRealtimeInput({media: createBlob(audioData)});
    });
  });

  // Start the server
  // TODO: b/365983316 - Support configuring a different port.
  const port = 8000;
  await server.listen(port, async () => {
    console.log(`Server running on port ${port}`);
  });
}

main();

/* eslint no-constant-condition: 1 */
/* eslint @typescript-eslint/no-require-imports: 1 */



================================================
File: sdk-samples/web/README.md
================================================
# GenAI SDK TypeScript Web Sample

This is a sample web app using the typescript SDK.

To run:

```
npm install
npm run dev
```


================================================
File: sdk-samples/web/eslint.config.js
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)



================================================
File: sdk-samples/web/vite.config.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig} from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
});



================================================
File: sdk-samples/web/src/App.tsx
================================================
import {ChangeEvent, useState} from 'react';
import './App.css';
import GenerateContentText from './GenerateContentText';
import TextAndImage from './TextAndImage';
import UploadFile from './UploadFile';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [vertexai, setVertexai] = useState<boolean>(false);

  const handleKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const handleVertexaiChange = (value: boolean) => {
    setVertexai(value);
  };

  return (
    <>
      <h1>Google GenAI TypeScript SDK demo</h1>
      <div className="card">
        <form>
          <label htmlFor="apikey">API key:</label>
          <input
            className="form-control"
            id="apikey"
            type="password"
            onChange={handleKeyChange}
            value={apiKey}
          />
        </form>
        <br />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <label htmlFor="backend">Backend:</label>

          <div style={{flexDirection: 'column'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <input
                type="radio"
                value="false"
                checked={vertexai === false}
                onChange={() => handleVertexaiChange(false)}
              />
              <label style={{marginLeft: '5px'}}>Gemini Developer API</label>
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <input
                type="radio"
                value="true"
                checked={vertexai === true}
                onChange={() => handleVertexaiChange(true)}
              />
              <label style={{marginLeft: '5px'}}>Vertex AI API</label>
            </div>
          </div>
        </div>
      </div>
      <GenerateContentText apiKey={apiKey} vertexai={vertexai} />
      <UploadFile apiKey={apiKey} vertexai={vertexai} />
      <TextAndImage apiKey={apiKey} vertexai={vertexai} />
    </>
  );
}

export default App;



================================================
File: sdk-samples/web/src/GenerateContentText.tsx
================================================
import {GoogleGenAI} from '@google/genai';
import {ChangeEvent, useState} from 'react';
import './App.css';

export default function GenerateContentText({
  apiKey,
  vertexai,
}: {
  apiKey: string;
  vertexai: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [modelResponse, setModelResponse] = useState('');

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSend = async () => {
    const ai = new GoogleGenAI({vertexai: vertexai, apiKey: apiKey});
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });
    setModelResponse(response.text ?? 'Empty response');
  };

  return (
    <>
      <div className="card">
        <h2 className="card-title">Text generation sample</h2>
        <form>
          <label htmlFor="prompt" className="form-label">
            Prompt:
          </label>
          <textarea
            className="form-control"
            id="prompt1"
            onChange={handlePromptChange}
          />
          <button
            type="button"
            style={{marginTop: '10px', marginBottom: '10px'}}
            className="btn btn-primary"
            onClick={handleSend}>
            Send
          </button>
          <br />
          <label htmlFor="response" className="form-label">
            Response:
          </label>
          <div className="card">{modelResponse}</div>
        </form>
      </div>
    </>
  );
}



================================================
File: sdk-samples/web/src/ImageUpload.tsx
================================================
import {File as GenAIFile} from '@google/genai';
import React, {useCallback, useRef, useState} from 'react';

interface ImageUploadProps {
  onUploadSuccess?: (response: GenAIFile) => void;
  onUploadError?: (error: Error) => void;
  ai: any;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  ai,
}) => {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFileToUpload(file);
      setUploadedImageUri(null);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      setFileToUpload(file);
      setUploadedImageUri(null);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleUpload = async () => {
    if (!fileToUpload) return;

    setIsUploading(true);
    try {
      const response = await ai.files.upload({file: fileToUpload});
      setIsUploading(false);

      if (response && response.uri) {
        setUploadedImageUri(response.uri);
      }

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (error) {
      setIsUploading(false);
      if (onUploadError) {
        if (error instanceof Error) {
          onUploadError(error);
        } else {
          onUploadError(new Error('An unknown error occurred during upload.'));
        }
      }
      console.error('Upload error:', error);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: '2px dashed #ccc',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}>
      {fileToUpload ? ( // Show preview if available
        <div>
          <img
            src={URL.createObjectURL(fileToUpload)}
            alt="Preview"
            style={{maxWidth: '300px', maxHeight: '300px'}}
          />
          {isUploading ? ( // Show uploading indicator if uploading
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Uploading...</span>
            </div>
          ) : uploadedImageUri ? ( // Show Upload new Image button if uploaded
            <div>
              <p>Image uploaded successfully!</p>
              <button
                className="btn btn-secondary mt-2"
                onClick={() => {
                  setUploadedImageUri(null);
                  setFileToUpload(null);
                }}>
                Upload new Image
              </button>
            </div>
          ) : (
            // Show upload button if not uploading and no uploaded image
            <div>
              <p>File: {fileToUpload?.name}</p>
              <button className="btn btn-primary" onClick={handleUpload}>
                Upload
              </button>
            </div>
          )}
        </div>
      ) : (
        // Show file selection if no preview
        <div>
          <p>Drag and drop an image here, or click to select a file.</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{display: 'none'}}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => fileInputRef.current?.click()}>
            Select File
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;



================================================
File: sdk-samples/web/src/TextAndImage.tsx
================================================
import {
  ContentListUnion,
  File,
  GenerateContentResponse,
  GoogleGenAI,
  createPartFromUri,
} from '@google/genai';
import {ChangeEvent, useState} from 'react';
import './App.css';
import {ImageUpload} from './ImageUpload';

export default function TextAndImage({
  apiKey,
  vertexai,
}: {
  apiKey: string;
  vertexai: boolean;
}) {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [modelResponse, setModelResponse] = useState<
    GenerateContentResponse | string | null
  >(null);

  const ai = new GoogleGenAI({vertexai: vertexai, apiKey: apiKey});

  const handleUploadSuccess = (response: any) => {
    setUploadStatus('Image uploaded successfully!');
    setInputImage(response);
  };

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSend = async () => {
    if (
      inputImage == null ||
      inputImage.uri == null ||
      inputImage.mimeType == null
    ) {
      console.log('Missing input image', inputImage);
      return;
    }
    const contents: ContentListUnion = [prompt];
    contents.push(createPartFromUri(inputImage.uri, inputImage.mimeType));
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: contents,
        config: {
          responseModalities: ['image', 'text'],
          responseMimeType: 'text/plain',
        },
      });
      setModelResponse(response);
    } catch (error) {
      console.error('Error generating content:', error);
      setModelResponse(
        `Generate content failed with error: ${(error as Error).message}`,
      );
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error.message);
    setUploadStatus(`Upload failed: ${error.message}`);
  };

  return (
    <div className="card">
      <h2 className="card-title">Text+Image -&gt; Text+Image Example</h2>
      <br />
      <div>
        <ImageUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          ai={ai}
        />
        <label htmlFor="prompt" className="form-label">
          Prompt:
        </label>
        <textarea
          className="form-control"
          id="prompt2"
          onChange={handlePromptChange}
        />
        {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSend}
          style={{marginTop: '10px', marginBottom: '10px'}}>
          Send
        </button>
      </div>
      {modelResponse &&
      modelResponse instanceof GenerateContentResponse &&
      modelResponse.candidates ? (
        <div className="mt-4">
          <h2>Response:</h2>
          {modelResponse.candidates.map((candidate, candidateIndex) => (
            <div key={`candidate-${candidateIndex}`}>
              {candidate.content &&
                candidate.content.parts &&
                candidate.content.parts.map((part, partIndex) => (
                  <div key={`part-${partIndex}`}>
                    {part.text && <p>{part.text}</p>}
                    {part.inlineData &&
                      part.inlineData.data &&
                      part.inlineData.mimeType && (
                        <img
                          src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                          alt="Generated Image"
                          className="img-fluid"
                        />
                      )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        modelResponse &&
        typeof modelResponse === 'string' && (
          <div className="mt-4">
            <h2>Response:</h2>
            {modelResponse}
          </div>
        )
      )}
    </div>
  );
}



================================================
File: sdk-samples/web/src/UploadFile.tsx
================================================
import {
  ContentListUnion,
  File,
  GoogleGenAI,
  createPartFromUri,
} from '@google/genai';
import {ChangeEvent, useState} from 'react';
import './App.css';

export default function UploadFile({
  apiKey,
  vertexai,
}: {
  apiKey: string;
  vertexai: boolean;
}) {
  const [modelResponse, setModelResponse] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // Use File type

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // Update uploaded file
      const ai = new GoogleGenAI({vertexai: vertexai, apiKey: apiKey});
      try {
        const response = await ai.files.upload({file: event.target.files[0]});
        setUploadedFile(response);
      } catch (error) {
        console.error('Upload error:', error);
        setModelResponse(
          `Upload failed with error: ${(error as Error).message}`,
        );
      }
    }
  };

  const handleDescribe = async () => {
    try {
      const ai = new GoogleGenAI({vertexai: false, apiKey: apiKey});
      const contents: ContentListUnion = ['Describe the file'];

      if (uploadedFile) {
        const resolvedFile = await uploadedFile;
        if (resolvedFile.uri && resolvedFile.mimeType) {
          const fileContent = createPartFromUri(
            resolvedFile.uri,
            resolvedFile.mimeType,
          );
          contents.push(fileContent);
        }

        let getFile = await ai.files.get({
          name: resolvedFile.name as string,
        });
        while (getFile.state === 'PROCESSING') {
          getFile = await ai.files.get({name: resolvedFile.name as string});
          console.log(getFile);
          console.log('File is still processing, retrying in 5 seconds');

          await new Promise((resolve) => {
            setTimeout(resolve, 5000);
          });
        }
        if (resolvedFile.state === 'FAILED') {
          setModelResponse('File processing failed.');
          return;
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      setModelResponse(text ?? 'Empty response');
    } catch (error) {
      console.error('Describe error:', error);
      setModelResponse('Description failed.');
    }
  };

  return (
    <>
      <div className="card">
        <div>
          <h2 className="card-title">File upload sample</h2>
          <form>
            <label htmlFor="srcFile" style={{marginRight: '10px'}}>
              Upload file:
            </label>
            <input
              type="file"
              id="srcFile"
              className="form-control"
              onChange={handleFileUpload}
              style={{marginRight: '10px'}}
            />
            <button
              type="button"
              style={{marginTop: '10px', marginBottom: '10px'}}
              className="btn btn-primary"
              onClick={handleDescribe}>
              Describe
            </button>
          </form>
        </div>
        <label htmlFor="response" className="form-label">
          Response:
        </label>
        <div className="card">{modelResponse ?? 'Response'}</div>
      </div>
    </>
  );
}



================================================
File: sdk-samples/web/src/main.tsx
================================================
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Import our custom CSS
import './scss/styles.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);



================================================
File: sdk-samples/web/src/vite-env.d.ts
================================================
/// <reference types="vite/client" />



================================================
File: sdk-samples/web/src/scss/styles.scss
================================================
@import "~bootstrap/scss/bootstrap";



================================================
File: src/_api_client.ts
================================================
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Auth} from './_auth';
import * as common from './_common';
import {Uploader} from './_uploader';
import {File, HttpOptions, HttpResponse, UploadFileConfig} from './types';

const CONTENT_TYPE_HEADER = 'Content-Type';
const USER_AGENT_HEADER = 'User-Agent';
const GOOGLE_API_CLIENT_HEADER = 'x-goog-api-client';
export const SDK_VERSION = '0.6.0'; // x-release-please-version
const LIBRARY_LABEL = `google-genai-sdk/${SDK_VERSION}`;
const VERTEX_AI_API_DEFAULT_VERSION = 'v1beta1';
const GOOGLE_AI_API_DEFAULT_VERSION = 'v1beta';
const responseLineRE = /^data: (.*)(?:\n\n|\r\r|\r\n\r\n)/;

/**
 * Client errors raised by the GenAI API.
 */
export class ClientError extends Error {
  constructor(message: string, stackTrace?: string) {
    if (stackTrace) {
      super(message, {cause: stackTrace});
    } else {
      super(message, {cause: new Error().stack});
    }
    this.message = message;
    this.name = 'ClientError';
  }
}

/**
 * Server errors raised by the GenAI API.
 */
export class ServerError extends Error {
  constructor(message: string, stackTrace?: string) {
    if (stackTrace) {
      super(message, {cause: stackTrace});
    } else {
      super(message, {cause: new Error().stack});
    }
    this.message = message;
    this.name = 'ServerError';
  }
}

/**
 * Options for initializing the ApiClient. The ApiClient uses the parameters
 * for authentication purposes as well as to infer if SDK should send the
 * request to Vertex AI or Gemini API.
 */
export interface ApiClientInitOptions {
  /**
   * The object used for adding authentication headers to API requests.
   */
  auth: Auth;
  /**
   * The uploader to use for uploading files. This field is required for
   * creating a client, will be set through the Node_client or Web_client.
   */
  uploader: Uploader;
  /**
   * Optional. The Google Cloud project ID for Vertex AI users.
   * It is not the numeric project name.
   * If not provided, SDK will try to resolve it from runtime environment.
   */
  project?: string;
  /**
   * Optional. The Google Cloud project location for Vertex AI users.
   * If not provided, SDK will try to resolve it from runtime environment.
   */
  location?: string;
  /**
   * The API Key. This is required for Gemini API users.
   */
  apiKey?: string;
  /**
   * Optional. Set to true if you intend to call Vertex AI endpoints.
   * If unset, default SDK behavior is to call Gemini API.
   */
  vertexai?: boolean;
  /**
   * Optional. The API version for the endpoint.
   * If unset, SDK will choose a default api version.
   */
  apiVersion?: string;
  /**
   * Optional. A set of customizable configuration for HTTP requests.
   */
  httpOptions?: HttpOptions;
  /**
   * Optional. An extra string to append at the end of the User-Agent header.
   *
   * This can be used to e.g specify the runtime and its version.
   */
  userAgentExtra?: string;
}

/**
 * Represents the necessary information to send a request to an API endpoint.
 * This interface defines the structure for constructing and executing HTTP
 * requests.
 */
export interface HttpRequest {
  /**
   * URL path from the modules, this path is appended to the base API URL to
   * form the complete request URL.
   *
   * If you wish to set full URL, use httpOptions.baseUrl instead. Example to
   * set full URL in the request:
   *
   * const request: HttpRequest = {
   *   path: '',
   *   httpOptions: {
   *     baseUrl: 'https://<custom-full-url>',
   *     apiVersion: '',
   *   },
   *   http