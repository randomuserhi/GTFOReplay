interface hljs
{
    highlightElement(el: HTMLElement): void;
}

declare const hljs: hljs;

interface Window
{
    hljs: hljs;
}