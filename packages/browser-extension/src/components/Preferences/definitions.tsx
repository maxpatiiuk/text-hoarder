import { preferencesText } from '../../../../common/src/localization/preferencesText';
import { Renderers } from './Renderers';
import { IR } from '../../../../common/src/utils/types';
import { readerText } from '../../../../common/src/localization/readerText';
import { AutoTriggerUrls } from './AutoTriggerUrls';
import { StorageDefinitions } from '../../../../common/src/utils/storage';

export const definitions: IR<
  Partial<{
    readonly [KEY in keyof StorageDefinitions]: (
      value: StorageDefinitions[KEY],
      setValue: (newValue: StorageDefinitions[KEY], apply?: boolean) => void,
    ) => JSX.Element;
  }>
> = {
  [readerText.readerMode]: {
    'ui.theme': Renderers.Select(preferencesText.theme, {
      system: preferencesText.system,
      light: preferencesText.light,
      dark: preferencesText.dark,
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
    'reader.autoTriggerUrls': AutoTriggerUrls,
    'reader.restoreScrollPosition': Renderers.Select(
      preferencesText.restoreScrollPosition,
      {
        auto: preferencesText.automatic,
        smooth: preferencesText.smoothScroll,
        instant: preferencesText.instantScroll,
        none: preferencesText.dontRestoreScroll,
      },
    ),
    'reader.downloadFormat': Renderers.Select(preferencesText.downloadFormat, {
      html: preferencesText.html,
      markdown: preferencesText.markdown,
      text: preferencesText.text,
    }),
    'reader.allowScrollPastLastLine': Renderers.Checkbox(
      preferencesText.allowScrollPastLastLine,
    ),
    'reader.customCss': Renderers.TextArea(
      preferencesText.customCss,
      preferencesText.customCssPlaceholder,
    ),
    'reader.unfocusedMenuOpacity': Renderers.Range(
      preferencesText.unfocusedMenuOpacity,
      {
        min: 0,
        max: 100,
        step: 1,
      },
    ),
    'reader.eagerCheckForAlreadySaved': Renderers.Checkbox(
      preferencesText.eagerCheckForAlreadySaved,
    ),
  },
};
