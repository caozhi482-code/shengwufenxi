import type { SequenceCell, SequenceOperation } from '../../types/experiments';

const makeOp = (substance: string, sampleId: string, volume: number, scanned: boolean = false): SequenceOperation => ({
  id: `${substance}-${sampleId}`,
  action: substance,
  substance,
  sampleId,
  volume,
  unit: 'μL',
  scanned,
});

const emptyOps = (): SequenceOperation[] => [];

export const sequenceGrid: SequenceCell[] = Array.from({ length: 96 }, (_, i) => {
  const row = String.fromCharCode(65 + Math.floor(i / 12));
  const col = (i % 12) + 1;
  let ops: SequenceOperation[] = emptyOps();
  if (i === 0) ops = [makeOp('Equ', 'Equ', 100, true)];
  else if (i === 1) ops = [makeOp('SST', 'SST', 100, true)];
  else if (i === 2) ops = [makeOp('WS-STD8', 'STD8', 50, true), makeOp('空白基质', 'BL', 50, true)];
  else if (i === 3) ops = [makeOp('WS-LLOQ', 'LLOQ', 50, true), makeOp('QC', 'QC', 50, true)];
  else if (i === 4) ops = [makeOp('WS-MQC', 'MQC', 50, true)];
  else if (i === 5) ops = [makeOp('WS-HQC', 'HQ', 50, true)];
  else if (i >= 30 && i <= 32) {
    const samples = ['SP5830084', 'SP5830189', 'SP5830306'];
    ops = [makeOp('基质样品', samples[i - 30], 40, false), makeOp('沉淀剂', '0.1%甲酸甲醇', 400, false)];
  }
  return { row, col, operations: ops, selected: false };
});

export const sampleOptions = [
  { label: 'SP5830084', value: 'SP5830084' },
  { label: 'SP5830189', value: 'SP5830189' },
  { label: 'SP5830306', value: 'SP5830306' },
  { label: 'BL-2026-001 (空白基质)', value: 'BL-2026-001' },
  { label: 'STD1 (低浓度)', value: 'STD1' },
  { label: 'STD8 (高浓度)', value: 'STD8' },
  { label: 'LLOQ', value: 'LLOQ' },
  { label: 'MQC', value: 'MQC' },
  { label: 'HQ', value: 'HQ' },
];

export const reagentOptions = [
  { label: '内标工作液 IS-WS', value: 'IS-WS' },
  { label: '0.1%甲酸甲醇', value: 'FORMIC' },
  { label: '复溶液 (甲醇:水=1:1)', value: 'REDSOL' },
  { label: '超纯水', value: 'WATER' },
];
