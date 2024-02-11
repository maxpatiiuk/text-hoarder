import React from 'react';

import { useBooleanState } from '../../hooks/useBooleanState';
import type { RA } from '../../utils/types';
import { className } from '../Atoms/className';
import type { TagProps } from '@common/components/Atoms/wrap';
import { commonText } from '@common/localization/commonText';

export function FilePicker({
  acceptedFormats,
  containerClassName = 'h-44 w-full',
  disabled,
  ...rest
}: Pick<TagProps<'input'>, 'disabled'> & {
  readonly acceptedFormats: RA<string> | undefined;
  readonly containerClassName?: string;
  readonly onFileSelected: (file: File) => void;
}): JSX.Element {
  const filePickerButton = React.useRef<HTMLButtonElement>(null);
  function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    if (handleFileChange(event.target.files ?? undefined))
      event.target.value = '';
  }

  function handleFileChange(files: FileList | undefined): boolean {
    if (files !== undefined && files.length > 0) {
      rest.onFileSelected(files[0]);
      setFileName(files[0].name);
      return true;
    } else {
      setFileName(undefined);
      return false;
    }
  }

  const [fileName, setFileName] = React.useState<string | undefined>(undefined);
  const [isFocused, handleFocus, handleBlur] = useBooleanState();

  const { isDragging, callbacks } = useDragDropFiles(
    handleFileChange,
    filePickerButton,
  );
  return (
    <label
      className="contents"
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...callbacks}
    >
      <input
        accept={acceptedFormats?.join(',')}
        className="sr-only"
        disabled={disabled}
        multiple={false}
        required
        type="file"
        onChange={handleFileSelected}
      />
      <span
        className={`
          align-center flex justify-center text-center normal-case
          ${className.button}
          ${className.info}
          ${containerClassName}
          ${
            isDragging
              ? 'bg-white ring ring-brand-200 dark:bg-neutral-700 dark:ring-brand-400'
              : ''
          }
          ${isFocused ? '!ring ring-blue-500' : ''}
        `}
        ref={filePickerButton}
      >
        <span>
          {commonText.filePickerMessage}
          {typeof fileName === 'string' && (
            <>
              <br />
              <br />
              <b>
                {commonText.colonLine(commonText.selectedFileName, fileName)}
              </b>
            </>
          )}
        </span>
      </span>
    </label>
  );
}

export function useDragDropFiles(
  onFileChange: ((fileList: FileList) => void) | undefined,
  forwardRef: React.RefObject<HTMLElement>,
): {
  readonly isDragging: boolean;
  readonly callbacks: {
    readonly onDrop: (event: React.DragEvent) => void;
    readonly onDragLeave: (event: React.DragEvent) => void;
    readonly onDragEnter: (event: React.DragEvent) => void;
    readonly onDragOver: (event: React.DragEvent) => void;
  };
} {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const handleFileDropped = React.useCallback(
    (event: React.DragEvent) => {
      const fileList = event.dataTransfer?.files ?? undefined;
      onFileChange?.(fileList);
      preventPropagation(event);
      setIsDragging(false);
    },
    [setIsDragging, onFileChange],
  );

  const handleDragEnter = React.useCallback(
    (event: React.DragEvent) => {
      setIsDragging(
        typeof onFileChange === 'function' &&
          ((event.dataTransfer?.files?.length ?? 0) !== 0 ||
            (event.dataTransfer?.items.length ?? 0) !== 0),
      );
      preventPropagation(event);
    },
    [onFileChange, setIsDragging],
  );

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent) => {
      if (
        event.relatedTarget === null ||
        forwardRef.current === null ||
        event.target !== forwardRef.current ||
        forwardRef.current.contains(event.relatedTarget as Node)
      )
        return;
      setIsDragging(false);
      preventPropagation(event);
    },
    [setIsDragging],
  );

  return {
    isDragging,
    callbacks: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleFileDropped,
      onDragOver: preventPropagation,
    },
  };
}

function preventPropagation(event: React.DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
}
