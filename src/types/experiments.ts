export type PlanStatus = 'draft' | 'published' | 'running' | 'done';
export type TaskStatus = 'pending' | 'scheduled' | 'executing' | 'review' | 'passed' | 'rejected' | 'done';
export type SheetStatus = 'pending' | 'executing' | 'submitted' | 'reviewing' | 'passed' | 'rejected';
export type ResultStatus = 'pass' | 'fail' | 'pending' | 'na';
export type ScanObjectType = 'device' | 'reagent' | 'sample' | 'consumable';
export type DeviationType = 'procedure' | 'equipment' | 'reagent' | 'sample' | 'environment';

export interface CellOperation {
  id: string;
  action: string;
  substance?: string;
  sampleId?: string;
  volume?: string;
  note?: string;
}

export interface FormCell {
  row: string;
  col: number;
  operations: CellOperation[];
  selected: boolean;
}

export interface FormTemplate {
  id: string;
  name: string;
  grid: { rows: string[]; cols: number };
  cellLabel: 'well' | 'none';
  sampleData?: FormCell[];
}

export interface TaskForm {
  taskId: string;
  templateId: string;
  templateName: string;
  cells: FormCell[];
  footer: { location?: string; time?: string; owner?: string; reviewer?: string };
  status: 'un编辑' | '编辑中' | '已编辑' | '已发布';
}

export interface Plan {
  id: string;
  code: string;
  projectName: string;
  version: string;
  methodCode: string;
  methodVersion: string;
  responsiblePerson: string;
  investigators: string[];
  itemCount: number;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface MethodFile {
  id: string;
  code: string;
  version: string;
  name: string;
  steps: MethodStep[];
}

export interface MethodStep {
  seq: number;
  action: string;
  expected: { value: number; unit: string }[];
  scanObjects: ScanObjectType[];
  requiredFields: string[];
  notes?: string;
}

export interface TaskStep {
  id: string;
  seq: number;
  action: string;
  expected: { value: number; unit: string }[];
  scanObjects: { type: ScanObjectType; name: string }[];
  requiredFields: string[];
  notes?: string;
}

export interface ScanItem {
  type: ScanObjectType;
  id: string;
  code: string;
  batch: string;
  scanned: boolean;
}

export interface Task {
  id: string;
  planId: string;
  taskName: string;
  itemCode: string;
  itemName: string;
  itemType: string;
  taskType: '定量' | '稳定性' | '专属性' | '系统适用性';
  methodId: string;
  methodCode: string;
  methodVersion: string;
  steps: TaskStep[];
  formTemplates: string[];
  responsiblePerson: string;
  investigators: string[];
  planDate: string;
  sampleBatch: string;
  instruments: string[];
  status: TaskStatus;
}

export interface DailySheet {
  id: string;
  date: string;
  itemCode: string;
  itemName: string;
  formTemplate: string;
  investigator: string;
  sampleBatch: string;
  instrument: string;
  stepVersion: string;
  status: SheetStatus;
}

export interface SequenceCell {
  row: string;
  col: number;
  operations: SequenceOperation[];
  selected: boolean;
}

export interface SequenceOperation {
  id: string;
  action: string;
  substance: string;
  sampleId: string;
  volume: number;
  unit: string;
  scanned: boolean;
  equipment?: string;
  scanObject?: string;
  required?: boolean;
  note?: string;
  step?: string;
}

export interface ValidationResult {
  itemId: string;
  itemName: string;
  status: ResultStatus;
  cv?: number;
  re?: number;
  recovery?: number;
  carryover?: number;
  stabilityDeviation?: number;
  acceptanceCriterion: string;
}

export interface Deviation {
  id: string;
  code: string;
  itemId: string;
  itemType: string;
  type: DeviationType;
  cause: string;
  resolution: string;
  reflectedInReport: boolean;
  qaStatus: 'pending' | 'approved' | 'rejected';
}

export type FormTemplateStatus = 'enabled' | 'disabled' | 'draft';
export type FormTemplateGroup = 'process' | 'prep' | 'stability' | 'general' | 'solution' | 'reference' | 'work' | 'split';
export type FormTemplatePreviewMode = 'plate' | 'record';

export interface FormTemplateRecord {
  id: string;
  templateName: string;
  templateCode: string;
  version: string;
  itemNames: string[];
  sourceFile: string;
  status: FormTemplateStatus;
  updatedAt: string;
  isDefault: boolean;
  description: string;
  previewMode: FormTemplatePreviewMode;
  group: FormTemplateGroup;
  context: {
    projectName?: string;
    projectCode: string;
    planCode: string;
    methodCode: string;
    methodVersion: string;
    fileCode: string;
  };
  structure: {
    sections: string[];
    fields: string[];
    summary: string;
    highlights: string[];
    tableColumns?: string[];
    plate?: { rows: string[]; cols: number };
    tableRows?: string[][];
    stabilityTableColumns?: string[];
    stabilityTableRows?: string[][];
    notes?: string[];
    signatureLabels?: string[];
    batchLabel?: string;
    titleTags?: string[];
    solventFields?: string[];
  };
}

export type SDResourceType = 'reagent' | 'consumable' | 'equipment' | 'standard' | 'control' | 'other';
export type SDResourceStatus = 'pending' | 'confirmed' | 'reserved' | 'purchasing' | 'arrived' | 'shortage';

export interface SDResourceItem {
  id: string;
  instanceId: string;
  itemId: string;
  itemName: string;
  templateId: string;
  templateName: string;
  name: string;
  materialCode: string;
  type: SDResourceType;
  specification: string;
  unit: string;
  plannedQty: number;
  currentStock: number;
  gapQty: number;
  brand: string;
  expectedArrival: string;
  isCritical: boolean;
  priority: 'high' | 'medium' | 'low';
  status: SDResourceStatus;
  remark: string;
}

export interface SDPlanningRecord {
  planCode: string;
  projectId: string;
  sdOwner: string;
  items: SDResourceItem[];
  completed: boolean;
}
