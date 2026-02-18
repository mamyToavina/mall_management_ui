export interface Credit {
    _id: string;
    code: string;
    value: number;
    status: 'active' | 'used';
    isPrinted: boolean;
    usedBy?: string;
    usedAt?: string;
    printedAt?: string;
}
  