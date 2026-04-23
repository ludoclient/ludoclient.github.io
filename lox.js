(function() {
    const modal = document.getElementById('paymentModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const buyButtons = document.querySelectorAll('.buy-btn');
    const paymentForm = document.getElementById('paymentForm');
    const planSelect = document.getElementById('planSelect');
    const keyResultDiv = document.getElementById('keyResult');
    const generatedKeySpan = document.getElementById('generatedKey');
    const copyBtn = document.getElementById('copyKeyBtn');
    const paymentAmountDiv = document.getElementById('paymentAmount');
    const payButton = document.getElementById('payButton');

    let currentPlanType = 'static';
    let currentPeriod = 'monthly';
    let currentPrice = 0.99;

    function generateRandomKey(length = 30) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const cryptoArray = window.crypto && window.crypto.getRandomValues ? 
            new Uint8Array(length) : null;
        
        if (cryptoArray) {
            window.crypto.getRandomValues(cryptoArray);
            for (let i = 0; i < length; i++) {
                result += chars[cryptoArray[i] % chars.length];
            }
        } else {
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        return result;
    }

    function generateLudoKey() {
        const randomPart = generateRandomKey(30);
        return `ludik://GG.${randomPart}`;
    }

    function updatePlanSelect(planType, monthlyPrice, yearlyPrice) {
        planSelect.innerHTML = '';
        
        const monthlyOption = document.createElement('option');
        monthlyOption.value = `monthly_${planType}_${monthlyPrice}`;
        monthlyOption.textContent = `📆 Месячная подписка — $${monthlyPrice}`;
        
        const yearlyOption = document.createElement('option');
        yearlyOption.value = `yearly_${planType}_${yearlyPrice}`;
        yearlyOption.textContent = `🌟 Годовая подписка — $${yearlyPrice}`;
        
        planSelect.appendChild(monthlyOption);
        planSelect.appendChild(yearlyOption);
        
        planSelect.dataset.monthlyPrice = monthlyPrice;
        planSelect.dataset.yearlyPrice = yearlyPrice;
        planSelect.dataset.planType = planType;
        
        currentPlanType = planType;
        currentPeriod = 'monthly';
        currentPrice = parseFloat(monthlyPrice);
        updatePaymentAmount();
    }

    function updatePaymentAmount() {
        const selectedValue = planSelect.value;
        if (selectedValue.includes('monthly')) {
            currentPeriod = 'monthly';
            currentPrice = parseFloat(planSelect.dataset.monthlyPrice);
        } else {
            currentPeriod = 'yearly';
            currentPrice = parseFloat(planSelect.dataset.yearlyPrice);
        }
        paymentAmountDiv.textContent = `Сумма к оплате: $${currentPrice.toFixed(2)}`;
    }

    function openPaymentModal(planType, monthlyPrice, yearlyPrice) {
        updatePlanSelect(planType, monthlyPrice, yearlyPrice);
        paymentForm.reset();
        keyResultDiv.classList.add('hidden');
        
        paymentForm.style.display = 'block';
        keyResultDiv.classList.add('hidden');
        
        modal.style.display = 'flex';
    }

    function validateCardDetails(cardName, cardNumber, expiry, cvv) {
        if (!cardName || cardName.length < 3) return false;
        const digitsOnly = cardNumber.replace(/\s/g, '');
        if (digitsOnly.length < 15 || digitsOnly.length > 16) return false;
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
        if (!/^\d{3,4}$/.test(cvv)) return false;
        return true;
    }

    function processPayment(e) {
        e.preventDefault();
        
        const cardName = document.getElementById('cardName').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiry = document.getElementById('expiry').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        
        if (!cardName || !cardNumber || !expiry || !cvv) {
            alert('Пожалуйста епт, заполните все поля платежной информации.');
            return;
        }
        
        if (!validateCardDetails(cardName, cardNumber, expiry, cvv)) {
            alert('Проверьте правильность введенных данных карты.');
            return;
        }
        
        // Симуляция обработки платежа
        payButton.textContent = 'Обработка...';
        payButton.disabled = true;
        
        setTimeout(() => {
            const newKey = generateLudoKey();
            generatedKeySpan.textContent = newKey;
            
            paymentForm.style.display = 'none';
            keyResultDiv.classList.remove('hidden');
            
            const planName = currentPlanType === 'static' ? 'Static' : 'Prime';
            const periodText = currentPeriod === 'monthly' ? 'месяц' : 'год';
            console.log(`[LudoClient] Подписка ${planName} (${periodText}) активирована. Ключ: ${newKey}`);
            
            payButton.textContent = 'Оплатить и получить ключ';
            payButton.disabled = false;
        }, 1500);
    }
    
    function copyKey() {
        const keyText = generatedKeySpan.textContent;
        if (!keyText || keyText === 'ludik://GG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') return;
        
        navigator.clipboard.writeText(keyText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Скопировано!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            alert('Нажмите Ctrl+C для копирования ключа');
        });
    }
    
    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const planType = btn.getAttribute('data-type');
            let monthlyPrice, yearlyPrice;
            if (planType === 'static') {
                monthlyPrice = '0.99';
                yearlyPrice = '6';
            } else {
                monthlyPrice = '4';
                yearlyPrice = '12.50';
            }
            openPaymentModal(planType, monthlyPrice, yearlyPrice);
        });
    });
    
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        paymentForm.style.display = 'block';
        keyResultDiv.classList.add('hidden');
        payButton.disabled = false;
        payButton.textContent = 'Оплатить и получить ключ';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            paymentForm.style.display = 'block';
            keyResultDiv.classList.add('hidden');
            payButton.disabled = false;
            payButton.textContent = 'Оплатить и получить ключ';
        }
    });
    
    planSelect.addEventListener('change', updatePaymentAmount);
    
    paymentForm.addEventListener('submit', processPayment);
    
    copyBtn.addEventListener('click', copyKey);
    
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\s/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += value[i];
            }
            this.value = formatted;
        });
    }
    
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let val = this.value.replace(/\D/g, '');
            if (val.length >= 2) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4);
            }
            this.value = val.slice(0, 5);
        });
    }
    
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 4);
        });
    }
    
    console.log('[LudoClient] Система активации ключей готова. При покупке генерируется реальный ключ по шаблону ludik://GG.*');
})();
