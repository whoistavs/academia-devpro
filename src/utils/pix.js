
function formatField(id, value) {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function crc16CCITT(str) {
    let crc = 0xFFFF;
    const strlen = str.length;
    for (let c = 0; c < strlen; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload({ key, name, city = 'SAO PAULO', amount, txid = '***' }) {
    const cleanName = removeAccents(name).substring(0, 25).toUpperCase();
    const cleanCity = removeAccents(city).substring(0, 15).toUpperCase();
    const amountStr = amount.toFixed(2);

    
    const gui = formatField('00', 'br.gov.bcb.pix');
    const keyField = formatField('01', key);
    const merchantAccount = formatField('26', gui + keyField);

    
    const merchantCategory = formatField('52', '0000');

    
    const currency = formatField('53', '986');

    
    const amountField = formatField('54', amountStr);

    
    const country = formatField('58', 'BR');

    
    const merchantName = formatField('59', cleanName);

    
    const merchantCity = formatField('60', cleanCity);

    
    const txidField = formatField('05', txid);
    const additionalData = formatField('62', txidField);

    
    const payload = '000201' + merchantAccount + merchantCategory + currency + amountField + country + merchantName + merchantCity + additionalData + '6304';

    
    const crc = crc16CCITT(payload);

    return payload + crc;
}
