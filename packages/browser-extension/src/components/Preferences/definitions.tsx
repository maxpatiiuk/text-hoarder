import { preferencesText } from '../../localization/preferencesText';
import { StorageDefinitions } from '../../hooks/useStorage';
import { Renderers } from './Renderers';

// FEATURE: add more preferences?
// FEATURE: make preferences also accessible at options_page (or instead of this)

export const definitions: Partial<{
  readonly [KEY in keyof StorageDefinitions]: (
    value: StorageDefinitions[KEY],
    setValue: (newValue: StorageDefinitions[KEY], apply?: boolean) => void,
  ) => JSX.Element;
}> = {
  'ui.theme': Renderers.Select(preferencesText.theme, {
    system: preferencesText.system,
    light: preferencesText.light,
    dark: preferencesText.dark,
  }),
  'reader.allowScrollPastLastLine': Renderers.Checkbox(
    preferencesText.allowScrollPastLastLine,
  ),
  'reader.downloadFormat': Renderers.Select(preferencesText.downloadFormat, {
    html: preferencesText.html,
    markdown: preferencesText.markdown,
    text: preferencesText.text,
  }),
  'reader.fontSize': Renderers.Range(preferencesText.fontSize, {
    min: 5,
    max: 60,
    step: 0.5,
  }),
  'reader.lineHeight': Renderers.Range(preferencesText.lineHeight, {
    min: 0.1,
    max: 4,
    step: 0.1,
  }),
  'reader.fontFamily': Renderers.Select(preferencesText.fontFamily, {
    'sans-serif': preferencesText.sansSerif,
    monospace: preferencesText.monospace,
    serif: preferencesText.serif,
  }),
  'reader.pageWidth': Renderers.Range(preferencesText.pageWidth, {
    min: 20,
    max: 200,
    step: 1,
  }),
  'reader.customCss': Renderers.TextArea(
    preferencesText.customCss,
    preferencesText.customCssPlaceholder,
  ),
};
