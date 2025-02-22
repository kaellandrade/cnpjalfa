class ValidadorCnpjAlfa {
    /**
     * Expressão regular para identificar caracteres não permitidos.
     */
    public static readonly regexCaracteresNaoPermitidos: RegExp = /[^A-Z\d./-]/i;

    /**
     * Comprimento do CNPJ sem os dígitos verificadores.
     */
    private static readonly tamanhoCNPJSemDV: number = 12;

    /**
     * Expressão regular para validar um CNPJ sem dígitos verificadores.
     */
    private static readonly regexCNPJSemDV: RegExp = /^([A-Z\d]){12}$/;

    /**
     * Expressão regular para validar um CNPJ completo (com DV).
     */
    private static readonly regexCNPJ: RegExp = /^([A-Z\d]){12}(\d){2}$/;

    /**
     * Expressão regular para identificar os caracteres de máscara no CNPJ.
     */
    private static readonly regexCaracteresMascara: RegExp = /[./-]/g;

    /**
     * Valor base para conversão de caracteres em números (código ASCII de '0').
     */
    private static readonly valorBase: number = '0'.charCodeAt(0);

    /**
     * Pesos utilizados no cálculo dos dígitos verificadores do CNPJ.
     */
    private static readonly pesosDV: number[] = [
        6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
    ];

    /**
     * Representação de um CNPJ com todos os dígitos zerados.
     */
    private static readonly cnpjZerado: string = '00000000000000';

    /**
     * Construtor privado para impedir a instanciação da classe.
     */
    private constructor() {}

    /**
     * Gera um CNPJ aleatório, podendo ser numérico ou alfanumérico.
     * @param isAlfaNumerico Indica se o CNPJ gerado deve conter caracteres alfanuméricos.
     * @returns CNPJ gerado.
     */
    public static gerarCNPJ(isAlfaNumerico = true): string {
        let cnpjGerado = '';
        const LEN_CNPJ_SEM_DV = 12;
        const DESLOCAMENTO_ASCII = 48;
        const rangeLetrasAscii: [17, 42] = [17, 42]; // {A,B, C .... Z}
        const rangeNum: [0, 9] = [0, 9]; // {0 .... 9}

        const [minAscii, maxAscii] = rangeLetrasAscii;
        const [minNum, maxNum] = rangeNum;

        if (!isAlfaNumerico) {
            for (let i = 1; i <= LEN_CNPJ_SEM_DV; i++) {
                const caractereGerado = this.getRandomNumber(minNum, maxNum);
                cnpjGerado += caractereGerado;
            }
            return `${cnpjGerado}${this.calculaDV(cnpjGerado)}`;
        }

        for (let i = 1; i <= LEN_CNPJ_SEM_DV; i++) {
            const [numeroAscii, letraAscii] = [
                this.getRandomNumber(minNum, maxNum),
                this.getRandomNumber(minAscii, maxAscii),
            ];
            const alfaNumerico = this.getRandomNumber(0, 1);

            if (alfaNumerico === 0) {
                cnpjGerado += numeroAscii;
                continue;
            }
            cnpjGerado += String.fromCharCode(letraAscii + DESLOCAMENTO_ASCII);
        }
        return `${cnpjGerado}${this.calculaDV(cnpjGerado)}`;
    }

    /**
     * Verifica se um CNPJ alfanumérico, com ou sem máscara, é válido.
     * @param cnpjComOuSemMacara CNPJ a ser validado.
     * @returns Retorna `true` se for válido, caso contrário, `false`.
     */
    static isCNPJAlfaValido(cnpjComOuSemMacara: string): boolean {
        if (!cnpjComOuSemMacara) return false;

        if (!this.regexCaracteresNaoPermitidos.test(cnpjComOuSemMacara)) {
            const cnpjSemMascara =
                    this.removeMascaraCNPJ(cnpjComOuSemMacara).toUpperCase();
            if (
                    this.regexCNPJ.test(cnpjSemMascara) &&
                    cnpjSemMascara !== this.cnpjZerado
            ) {
                const dvInformado = cnpjSemMascara.substring(this.tamanhoCNPJSemDV);
                const dvCalculado = this.calculaDV(
                        cnpjSemMascara.substring(0, this.tamanhoCNPJSemDV)
                );
                return dvInformado === dvCalculado;
            }
        }
        return false;
    }

    /**
     * Calcula os dígitos verificadores de um CNPJ.
     * @param cnpj CNPJ sem os dígitos verificadores.
     * @returns Os dois dígitos verificadores calculados.
     */
    private static calculaDV(cnpj: string): string | null {
        if (!this.regexCaracteresNaoPermitidos.test(cnpj)) {
            const cnpjSemMascara = this.removeMascaraCNPJ(cnpj);
            if (
                    this.regexCNPJSemDV.test(cnpjSemMascara) &&
                    cnpjSemMascara !== this.cnpjZerado.substring(0, this.tamanhoCNPJSemDV)
            ) {
                let somatorioDV1 = 0;
                let somatorioDV2 = 0;
                for (let i = 0; i < this.tamanhoCNPJSemDV; i++) {
                    const asciiDigito = cnpjSemMascara.charCodeAt(i) - this.valorBase;
                    somatorioDV1 += asciiDigito * this.pesosDV[i + 1];
                    somatorioDV2 += asciiDigito * this.pesosDV[i];
                }
                const dv1 = somatorioDV1 % 11 < 2 ? 0 : 11 - (somatorioDV1 % 11);
                somatorioDV2 += dv1 * this.pesosDV[this.tamanhoCNPJSemDV];
                const dv2 = somatorioDV2 % 11 < 2 ? 0 : 11 - (somatorioDV2 % 11);
                return `${dv1}${dv2}`;
            }
        }
        return null;
    }

    /**
     * Remove a máscara de um CNPJ, eliminando caracteres como '.' e '-'.
     * @param cnpj CNPJ com máscara.
     * @returns CNPJ sem máscara.
     */
    private static removeMascaraCNPJ(cnpj: string): string {
        return cnpj.replace(this.regexCaracteresMascara, '');
    }

    /**
     * Gera um número aleatório dentro de um intervalo especificado.
     * @param min Valor mínimo.
     * @param max Valor máximo.
     * @returns Número aleatório dentro do intervalo fornecido.
     */
    private static getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}


// ---------------------------------------------------------------------------------------------
console.log(ValidadorCnpjAlfa.gerarCNPJ()) // gera CNPJ alfa
console.log(ValidadorCnpjAlfa.gerarCNPJ(false)) // gera CNPJ numérico

// Gerando CNPJs alfas e núméricos e validando
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
// ---------------------------------------------------------------------------------------------
console.log(ValidadorCnpjAlfa.gerarCNPJ()) // gera CNPJ alfa
console.log(ValidadorCnpjAlfa.gerarCNPJ(false)) // gera CNPJ numérico

// Gerando CNPJs alfas e núméricos e validando
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ(false)))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))
console.log(ValidadorCnpjAlfa.isCNPJAlfaValido(ValidadorCnpjAlfa.gerarCNPJ()))