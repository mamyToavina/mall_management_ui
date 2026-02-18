export interface Credit {
    _id: string;
    code: string;
    value: number;
    status: 'active' | 'used';
    isPrinted: boolean;
  
    // Champs renvoyés par l’API (optionnels)
    printedAt?: string | null;
    createdBy?: string;
    usedBy?: string | null;
    usedAt?: string | null;
    expiresAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
  