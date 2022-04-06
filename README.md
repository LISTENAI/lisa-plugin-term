LISA Term Plugin [![test](https://github.com/LISTENAI/lisa-plugin-term/actions/workflows/test.yml/badge.svg)](https://github.com/LISTENAI/lisa-plugin-term/actions/workflows/test.yml)
==========

[![lpm-img]][lpm-url] [![issues][issues-img]][issues-url] [![stars][stars-img]][stars-url] [![commits][commits-img]][commits-url]

## 安装

1. 安装 [LISA](https://docs.listenai.com/tools/LISA_LPM/installation)
2. 安装插件

    ```sh
    lisa install -g @lisa-plugin/term
    ```

### 兼容性

* Windows, Linux 或 macOS
* Node.js 14 或 16 (建议)

## 使用

```
示例: lisa term -l
示例: lisa term -p /dev/cu.usbserial-0001 -b 115200

选项:
 -l, --list                    列出本机所有串口路径
 -p, --path <path>             指定串口路径
 -b, --baud <rate>             波特率 (默认: 115200)
     --databits <bits>         数据位 (默认: 8)
     --parity <parity>         校验位 (默认: none)
     --stopbits <bits>         停止位 (默认: 1)
 -h, --term-help               打印帮助
```

[lpm-img]: https://img.shields.io/badge/dynamic/json?style=flat-square&label=lpm&color=green&query=latestVersion&url=https%3A%2F%2Flpm.listenai.com%2Fapi%2Fcloud%2Fpackages%2Fdetail%3Fname%3D%40lisa-plugin%2Fterm
[lpm-url]: https://lpm.listenai.com/lpm/info/?keyword=%40lisa-plugin%2Fterm
[issues-img]: https://img.shields.io/github/issues/LISTENAI/lisa-plugin-term?style=flat-square
[issues-url]: https://github.com/LISTENAI/lisa-plugin-term/issues
[stars-img]: https://img.shields.io/github/stars/LISTENAI/lisa-plugin-term?style=flat-square
[stars-url]: https://github.com/LISTENAI/lisa-plugin-term/stargazers
[commits-img]: https://img.shields.io/github/last-commit/LISTENAI/lisa-plugin-term?style=flat-square
[commits-url]: https://github.com/LISTENAI/lisa-plugin-term/commits/master
