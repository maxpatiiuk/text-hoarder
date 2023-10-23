import React from 'react';
import { H2, Label } from '../Atoms';
import { Input, Select } from '../Atoms/Input';
import { preferencesText } from '../../localization/preferencesText';
import { useStorage } from '../../hooks/useStorage';

export function Preferences(): JSX.Element {
  return (
    <>
      <H2>{preferencesText.preferences}</H2>
      <Theme />
      <AllowScrollPastLastLine />
      <DownloadFormat />
      <FontSize />
      <LineHeight />
      <PageWidth />
    </>
  );
}

function Theme(): JSX.Element {
  const [theme, setTheme] = useStorage('ui.theme');
  return (
    <Label.Block>
      {preferencesText.theme}
      <Select
        value={theme}
        onValueChange={(newTheme): void => setTheme(newTheme as typeof theme)}
        size={3}
      >
        <option value="system">{preferencesText.system}</option>
        <option value="light">{preferencesText.light}</option>
        <option value="dark">{preferencesText.dark}</option>
      </Select>
    </Label.Block>
  );
}

function AllowScrollPastLastLine(): JSX.Element {
  const [allowScrollPastLastLine, setAllowScrollPastLastLine] = useStorage(
    'reader.allowScrollPastLastLine',
  );
  return (
    <Label.Inline>
      <Input.Checkbox
        checked={allowScrollPastLastLine}
        onValueChange={setAllowScrollPastLastLine}
      />
      {preferencesText.allowScrollPastLastLine}
    </Label.Inline>
  );
}

function DownloadFormat(): JSX.Element {
  const [downloadFormat, setDownloadFormat] = useStorage(
    'reader.downloadFormat',
  );
  return (
    <Label.Block>
      {preferencesText.theme}
      <Select
        value={downloadFormat}
        onValueChange={(newDownloadFormat): void =>
          setDownloadFormat(newDownloadFormat as typeof downloadFormat)
        }
        size={3}
      >
        <option value="html">{preferencesText.html}</option>
        <option value="markdown">{preferencesText.markdown}</option>
        <option value="text">{preferencesText.text}</option>
      </Select>
    </Label.Block>
  );
}

// FEATURE: allow for custom css

function FontSize(): JSX.Element {
  const [fontSize, setFontSize] = useStorage('reader.fontSize');
  return (
    <Label.Block>
      {preferencesText.fontSize}
      <Input.Range
        min={5}
        max={100}
        step={0.5}
        value={fontSize}
        onValueChange={setFontSize}
      />
    </Label.Block>
  );
}

function LineHeight(): JSX.Element {
  const [lineHeight, setLineHeight] = useStorage('reader.lineHeight');
  return (
    <Label.Block>
      {preferencesText.lineHeight}
      <Input.Range
        min={0.1}
        max={4}
        step={0.1}
        value={lineHeight}
        onValueChange={setLineHeight}
      />
    </Label.Block>
  );
}

function PageWidth(): JSX.Element {
  const [pageWidth, setPageWidth] = useStorage('reader.pageWidth');
  return (
    <Label.Block>
      {preferencesText.pageWidth}
      <Input.Range
        min={20}
        max={200}
        step={1}
        value={pageWidth}
        onValueChange={setPageWidth}
      />
    </Label.Block>
  );
}
