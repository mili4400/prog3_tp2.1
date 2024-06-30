class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    async getCurrencies() {
        try {
            const response = await fetch(`${this.apiUrl}/currencies`);
            const data = await response.json();
            this.currencies = Object.keys(data).map(code => ({ code }));
        } catch (error) {
            console.error('Error al buscar monmedas:', error);
        }
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency.code === toCurrency.code) {
            return amount;
        }
        try {
            const response = await fetch(`${this.apiUrl}/latest?from=${fromCurrency.code}&to=${toCurrency.code}`);
            const data = await response.json();
            const exchangeRate = data.rates[toCurrency.code];
            if (exchangeRate) {
                return amount * exchangeRate;
            } else {
                console.error('Codigos de monedas no validos.');
                return null;
            }
        }catch (error) {
            console.error('Error al convertir la moneda:', error);
            return null;
        }
    }
    async calculateRateDifference(date1, date2, baseCurrency, targetCurrency) {
        const rate1 = await getExchangeRate(date1, baseCurrency, targetCurrency);
        const rate2 = await getExchangeRate(date2, baseCurrency, targetCurrency);
    
        if (rate1 !== null && rate2 !== null) {
            const difference = rate2 - rate1;
            console.log(`Diferencia entre ${baseCurrency} y ${targetCurrency} el ${date1} y el ${date2}: ${difference}`);
        } else {
            console.log('No se pudieron obtener tasas de cambio para las fechas especificadas.');
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
