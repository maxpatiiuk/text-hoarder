# Front-end Localization

## Guidelines for Programmers

- All keys must use strict camel case, unless absolutely necessary to do
  otherwise (e.x, in case of proper nouns that contain numbers or capitalized
  letters)

- Prefer full terms rather than acronyms or shortened variants. Some people may
  be unfamiliar with the acronyms used.

  Also, a single term may have multiple shortened variants, leading to
  inconsistencies and bugs.

- Similarly, try to be as consistent as possible in key naming. For example, in
  case of the dialog that appears when upload plan is not defined, use
  `noUploadPlanDialogHeader`, `noUploadPlanDialogText` for specifying the header
  and the message of the dialog respectively.

- Each dictionary must be named in camel case and end with "Text" for
  consistency and easy grepping

- Do not use dynamic references.

  Incorrect example:

  ```javascript
  commonText[hasError ? 'errorOccurred' : 'successMessage'];
  ```

  Correct example:

  ```javascript
  hasError ? commonText.errorOccurred : commonText.successMessage;
  ```

  Similarly, don't construct key names dynamically. This is needed to simplify
  finding references of a particular key in code. Also, it allows to easily find
  unused values and remove them from the dictionary.

- Each entry may be a string, a JSX Element, or a function that takes arbitrary
  arguments and returns a string or a JSX Element. It is important to note that
  in the case of functions, it must be pure (e.x produce the same output given
  the same input). It should also not relay on any external variables as those
  should be specified as an argument instead.

  Incorrect example:

  ```javascript
  newGoal: () => `New Goal ${new Date().toDateString()}`;
  ```

  Correct example:

  ```javascript
  newGoal: (date: string) => `New Goal ${date}`;
  ```

## Localization Utils

### Copy strings from existing language into new language

1. Create and open an HTML page with a <textarea> element
2. Paste whole dictionary file content into textarea
3. Assign the `textarea` variable to the HTML Textbox element
4. Modify the following RegEx to suite the task

   In it's current form, it would copy 'en-us' strings and insert them at the
   end under a name of 'es-es'.

   ```javascript
   textarea.value = textarea.value.replaceAll(
     /(?<key>\w+):\s{\s+'en-us':([\s\S]+?(?=['`\)],\n)['`\)],\n)([\s\S]+?(?=\},\n))\},/g,
     "$1: {\n    'en-us':$2$3  'es-es':$2  },",
   );
   ```

   (Replace `en-us` with source and `ru-ru` with target)

### Extract serialized strings from dictionary

1. Create and open an HTML page with a <textarea> element
2. Paste whole dictionary file content into textarea
3. Assign the `textarea` variable to the HTML Textbox element
4. Run this code in the DevTools console:

   ```javascript
   dictionary = Object.fromEntries(
     Array.from(
       textarea.value.matchAll(
         /(?<key>\w+):\s{\s+'en-us':\s+(?:\(\s*\w[^)]+[^>]+>\s+)?\w*\(?['"`]?\n?(?<enUS>[\s\S]*?)['"`)]\s*\)?,\s+'ru-ru':\s+(?:\(\s*\w[^)]+[^>]+>\s+)?\w*\(?['"`]?\n?(?<ruRU>[\s\S]*?)['"`)]\s*\)?,/g,
       ),
       ({ groups: { key, ...strings } }) => [key, strings],
     ),
   );
   ```
