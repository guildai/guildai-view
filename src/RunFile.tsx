import React from 'react';

import { Stack } from '@mui/joy';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist as syntaxStyleLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vs2015 as syntaxStyleDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { parse as parsePath } from 'path-browserify';

import EmptyView from './components/EmptyView';
import EmptyPanel from './components/EmptyPanel';

import { useRunFile } from './runs';

import {
  isImageType,
  isTextType,
  useDarkTheme,
  useRefreshTrigger
} from './utils';

import { Run } from './types';

type TextFileViewProps = {
  file: Blob;
  language?: string;
};

function TextFileView({ file, language }: TextFileViewProps) {
  const [text, setText] = React.useState<string>('');

  React.useEffect(() => {
    file.text().then(setText);
  }, [file, setText]);

  const dark = useDarkTheme();

  return (
    <SyntaxHighlighter
      style={dark ? syntaxStyleDark : syntaxStyleLight}
      language={language || 'text'}
      customStyle={{
        margin: 0,
        flexGrow: 1,
        overflow: 'unset',
        fontSize: 'var(--joy-fontSize-sm)'
      }}
    >
      {text}
    </SyntaxHighlighter>
  );
}

type ImageViewProps = {
  file: Blob;
  name?: string;
};

function ImageView({ file, name }: ImageViewProps) {
  const ref = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.src = URL.createObjectURL(file);
    }
  }, [ref, file]);

  return <img ref={ref} alt={name} />;
}

type FileViewProps = {
  file: Blob;
  name?: string;
};

function FileView({ file, name }: FileViewProps) {
  const language = name ? languageForName(name) : undefined;

  if (language || isTextType(file.type)) {
    return <TextFileView file={file} language={language} />;
  } else if (isImageType(file.type)) {
    return <ImageView file={file} name={name} />;
  } else {
    return <EmptyView>Cannot display this file ({file.type})</EmptyView>;
  }
}

function languageForName(name: string): string {
  const p = parsePath(name);
  const ext: { [key: string]: string } = {
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.css': 'css',
    '.go': 'go',
    '.hs': 'haskell',
    '.jl': 'julia',
    '.java': 'java',
    '.js': 'javascript',
    '.json': 'json',
    '.latex': 'latex',
    '.lua': 'lua',
    '.md': 'markdown',
    '.py': 'python',
    '.r': 'r',
    '.sh': 'shell',
    '.tex': 'tex',
    '.ts': 'typescript',
    '.yaml': 'yaml',
    '.yml': 'yaml'
  };
  const basename: { [key: string]: string } = {
    Dockerfile: 'dockerfile',
    Makefile: 'makefile'
  };
  return ext[p.ext.toLowerCase()] || basename[p.base];
}

type RunFileProps = {
  run: Run;
  path: string;
};

export default function RunFile({ run, path }: RunFileProps) {
  const refetch = useRefreshTrigger();

  const [file, resp] = useRunFile(run, path, { refetch });

  return (
    <Stack sx={{ flex: 1, position: 'relative' }}>
      {file && <FileView file={file} name={path} />}
      {!resp && <EmptyPanel>Loading file...</EmptyPanel>}
      {resp &&
        !resp.ok &&
        (resp.status === 404 ? (
          <EmptyPanel>File not found</EmptyPanel>
        ) : (
          <EmptyPanel>Error reading file ({resp.status})</EmptyPanel>
        ))}
    </Stack>
  );
}
