import * as minimist from 'minimist';
import { prompt } from 'inquirer';
import { once } from 'events';
import { SerialPort } from 'serialport';
import { PortInfo } from '@serialport/bindings-interface';
import * as chalk from 'chalk';
import { promisify } from 'util';

import parseArgs from './utils/parseArgs';

const PORT_BLACKLIST = [
  '/dev/tty.BLTH',
  '/dev/tty.Bluetooth-Incoming-Port',
];

const EXAMPLE_PATH = (() => {
  switch (process.platform) {
    case 'win32': return 'COM1';
    case 'darwin': return '/dev/cu.usbserial-0001';
    default: return '/dev/ttyUSB0';
  }
})();

export async function getFilteredPorts(): Promise<PortInfo[]> {
  let ports = await SerialPort.list();
  ports = ports.filter(port => !PORT_BLACKLIST.includes(port.path));
  if (process.platform == 'darwin') {
    ports.forEach(port => port.path = port.path.replace(/^\/dev\/tty\./, '/dev/cu.'));
  }
  return ports;
}

function parseDataBits(input: string): 8 | 7 | 6 | 5 | undefined {
  const dataBits = parseInt(input);
  if (dataBits == 8) return dataBits;
  if (dataBits == 7) return dataBits;
  if (dataBits == 6) return dataBits;
  if (dataBits == 5) return dataBits;
}

function parseParity(input: string): 'none' | 'even' | 'mark' | 'odd' | 'space' | undefined {
  if (input == 'none') return input;
  if (input == 'even') return input;
  if (input == 'mark') return input;
  if (input == 'odd') return input;
  if (input == 'space') return input;
}

function parseStopBits(input: string): 1 | 2 | undefined {
  const stopBits = parseInt(input);
  if (stopBits == 1) return stopBits;
  if (stopBits == 2) return stopBits;
}

export const options = {
  'list': { short: 'l', help: '列出本机所有串口路径' },
  'path': { short: 'p', arg: 'path', help: '指定串口路径' },
  'baud': { short: 'b', arg: 'rate', help: '波特率 (默认: 115200)' },
  'databits': { arg: 'bits', help: '数据位 (默认: 8)' },
  'parity': { arg: 'parity', help: '校验位 (默认: none)' },
  'stopbits': { arg: 'bits', help: '停止位 (默认: 1)' },
  'reset': { short: 'r', help: '打开后自动复位设备 (NanoKit)' },
  'dump': { short: 'd', help: '以十六进制打印收到的数据' },
  'term-help': { short: 'h', help: '打印帮助' },
};

async function term(argv: string[]): Promise<void> {
  const { args, printHelp } = parseArgs(minimist(argv), options);
  if (args['term-help']) {
    return printHelp([
      'term -l',
      `term -p ${EXAMPLE_PATH} -b 115200`,
    ]);
  }

  if (args.list) {
    for (const port of await getFilteredPorts()) {
      console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`);
    }
    return;
  }

  async function askForPort(): Promise<string> {
    const ports = await getFilteredPorts();
    if (ports.length == 0) {
      throw new Error('未找到任何串口设备，请尝试使用 -p [path] 手动指定');
    }
    if (ports.length == 1) {
      return ports[0].path;
    }
    const { path } = await prompt([{
      type: 'list',
      name: 'path',
      message: '选择一个串口',
      choices: ports.map(port => port.path),
    }]);
    return path;
  }

  const path = args.path || await askForPort();
  const port = new SerialPort({
    path: path,
    baudRate: parseInt(args.baud ?? '') || 115200,
    dataBits: parseDataBits(args.databits ?? '') || 8,
    parity: parseParity(args.parity ?? '') || 'none',
    stopBits: parseStopBits(args.stopbits ?? '') || 1,
  });

  const set = promisify(port.set).bind(port);

  await once(port, 'open');
  await set({ rts: false, dtr: false });

  if (args.reset) {
    await set({ rts: false, dtr: true });
  }

  console.log(chalk.yellow(`-- 已打开串口 ${port.path}，波特率 ${port.baudRate} --`));
  console.log(chalk.yellow(`-- 按 Ctrl + C 退出 --`));

  if (args.dump) {
    port.on('data', (data: Buffer) => {
      for (let i = 0; i < data.length; i += 32) {
        const lead = chalk.gray(`0x${i.toString(16).padStart(4, '0')}:`);
        const dump = data.slice(i, i + 32).toString('hex').replace(/(.{2})/g, ' $1');
        console.log(`${lead}${dump}`);
      }
    });
  } else {
    port.pipe(process.stdout);
  }

  if (args.reset) {
    await set({ rts: false, dtr: false });
  }

  process.stdin.setRawMode(true);
  process.stdin.on('data', (input) => {
    for (const char of input) {
      if (char == 0x03) {
        port.close();
        return;
      }
    }
  });
  process.stdin.once('end', () => port.close());
  process.stdin.pipe(port);

  await once(port, 'close');
}

export async function undertake(argv: string[]): Promise<void> {
  try {
    await term(argv);
  } catch (e) {
    console.error('error', e);
  }
}
