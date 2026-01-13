
import { crc16ccitt } from 'crc';

export class Pix {
    constructor(pixKey, merchantName, merchantCity, amount, txId = '***') {
        this.pixKey = pixKey;
        this.merchantName = merchantName;
        this.merchantCity = merchantCity;
        this.amount = amount.toFixed(2);
        this.txId = txId;
    }

    formatData(id, value) {
        const len = value.length.toString().padStart(2, '0');
        return `${id}${len}${value}`;
    }

    getPayload() {
        const payload = [
            this.formatData('00', '01'), 
            this.formatData('26', 
                [
                    this.formatData('00', 'BR.GOV.BCB.PIX'),
                    this.formatData('01', this.pixKey)
                ].join('')
            ),
            this.formatData('52', '0000'), 
            this.formatData('53', '986'), 
            this.formatData('54', this.amount), 
            this.formatData('58', 'BR'), 
            this.formatData('59', this.merchantName), 
            this.formatData('60', this.merchantCity), 
            this.formatData('62', 
                this.formatData('05', this.txId) 
            )
        ];

        const payloadStr = payload.join('') + '6304';
        const crc = crc16ccitt(payloadStr).toString(16).toUpperCase().padStart(4, '0');

        return `${payloadStr}${crc}`;
    }
}
