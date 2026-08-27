(function() {
    // ---- случайный заголовок сайта ----
    const titleVariants = [
        "LudoClient > Официальный сайт",
        "LudoClient > Шатает анти-чит",
        "LudoClient > КАК ЭТО ПАТЧИТЬ Б##ТЬ",
        "LudoClient > Дешёво и полезно",
        "LudoClient > Лудомания",
        "LudoClient > Ты просто босс на#уй"
    ];
    const randomTitle = titleVariants[Math.floor(Math.random() * titleVariants.length)];
    document.title = randomTitle;

    // ---- DOM-элементы ----
    const modal = document.getElementById('paymentModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const buyButtons = document.querySelectorAll('.buy-btn');
    const paymentForm = document.getElementById('paymentForm');
    const planSelect = document.getElementById('planSelect');
    const planSelectWrapper = document.getElementById('planSelectWrapper');
    const planSelectTrigger = document.getElementById('planSelectTrigger');
    const planSelectOptions = document.getElementById('planSelectOptions');
    const selectedPlanText = document.getElementById('selectedPlanText');
    const keyResultDiv = document.getElementById('keyResult');
    const generatedKeySpan = document.getElementById('generatedKey');
    const copyBtn = document.getElementById('copyKeyBtn');
    const paymentAmountDiv = document.getElementById('paymentAmount');
    const payButton = document.getElementById('payButton');
    const modalTitle = document.getElementById('modalTitle');

    let currentPlanType = 'static';
    let currentPeriod = 'monthly';
    let currentPrice = 0.99;

    // ---- функция плавной смены текста ----
    function animateTextChange(element, newText) {
        if (element.textContent === newText) return; // если текст не меняется – ничего не делаем

        // Анимация исчезновения
        element.classList.remove('animated-text-in');
        element.classList.add('animated-text');
        
        setTimeout(() => {
            element.textContent = newText;
            element.classList.remove('animated-text');
            element.classList.add('animated-text-in');
        }, 150); // длительность fadeOut
    }

    // ---- генерация ключа ----
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
        return `ludik://GG.${generateRandomKey(30)}`;
    }

    // ---- обновление заголовка модалки с анимацией ----
    function updateModalTitle() {
        const planName = currentPlanType === 'static' ? 'Static' : 'Prime';
        const periodName = currentPeriod === 'monthly' ? 'месяц' : 'год';
        const newTitle = `Подписка ${planName} на ${periodName}`;
        animateTextChange(modalTitle, newTitle);
    }

    // ---- обновление кастомного dropdown ----
    function updatePlanSelect(planType, monthlyPrice, yearlyPrice) {
        planSelectOptions.innerHTML = '';
        const optionsData = [
            { value: `monthly_${planType}_${monthlyPrice}`, label: `Месячная подписка — $${monthlyPrice}` },
            { value: `yearly_${planType}_${yearlyPrice}`, label: `Годовая подписка — $${yearlyPrice}` }
        ];

        optionsData.forEach((opt, index) => {
            const li = document.createElement('li');
            li.dataset.value = opt.value;
            li.textContent = opt.label;
            if (index === 0) li.classList.add('selected');
            planSelectOptions.appendChild(li);
        });

        planSelect.innerHTML = '';
        optionsData.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            planSelect.appendChild(option);
        });

        const firstLi = planSelectOptions.querySelector('li');
        if (firstLi) {
            firstLi.classList.add('selected');
            // Плавно меняем текст триггера
            animateTextChange(selectedPlanText, firstLi.textContent);
            planSelect.value = firstLi.dataset.value;
        }

        planSelect.dataset.monthlyPrice = monthlyPrice;
        planSelect.dataset.yearlyPrice = yearlyPrice;
        planSelect.dataset.planType = planType;

        currentPlanType = planType;
        currentPeriod = 'monthly';
        currentPrice = parseFloat(monthlyPrice);
        updatePaymentAmount();
        updateModalTitle();
        closeDropdown();
    }

    // ---- открытие/закрытие dropdown ----
    function toggleDropdown() {
        planSelectTrigger.classList.toggle('open');
        planSelectOptions.classList.toggle('open');
    }

    function closeDropdown() {
        planSelectTrigger.classList.remove('open');
        planSelectOptions.classList.remove('open');
    }

    // ---- обновление суммы и периода с анимацией ----
    function updatePaymentAmount() {
        const selectedLi = planSelectOptions.querySelector('li.selected');
        if (!selectedLi) return;
        const val = selectedLi.dataset.value;
        if (val.includes('monthly')) {
            currentPeriod = 'monthly';
            currentPrice = parseFloat(planSelect.dataset.monthlyPrice);
        } else {
            currentPeriod = 'yearly';
            currentPrice = parseFloat(planSelect.dataset.yearlyPrice);
        }
        // Плавно меняем сумму
        const newAmount = `Сумма к оплате: $${currentPrice.toFixed(2)}`;
        animateTextChange(paymentAmountDiv, newAmount);
        planSelect.value = val;
        updateModalTitle();
    }

    // ---- открытие модалки ----
    function openPaymentModal(planType, monthlyPrice, yearlyPrice) {
        updatePlanSelect(planType, monthlyPrice, yearlyPrice);
        paymentForm.reset();
        keyResultDiv.classList.add('hidden');
        paymentForm.style.display = 'block';
        keyResultDiv.classList.add('hidden');
        modal.style.display = 'flex';
    }

    // ---- валидация карты ----
    function validateCardDetails(cardName, cardNumber, expiry, cvv) {
        if (!cardName || cardName.length < 3) return false;
        const digitsOnly = cardNumber.replace(/\s/g, '');
        if (digitsOnly.length < 15 || digitsOnly.length > 16) return false;
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
        if (!/^\d{3,4}$/.test(cvv)) return false;
        return true;
    }

    // ---- обработка платежа ----
    function processPayment(e) {
        e.preventDefault();

        const cardName = document.getElementById('cardName').value.trim();
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiry = document.getElementById('expiry').value.trim();
        const cvv = document.getElementById('cvv').value.trim();

        if (!cardName || !cardNumber || !expiry || !cvv) {
            alert('Пожалуйста, заполните все поля платежной информации.');
            return;
        }
        if (!validateCardDetails(cardName, cardNumber, expiry, cvv)) {
            alert('Проверьте правильность введенных данных карты.');
            return;
        }

        payButton.textContent = 'Обработка...';
        payButton.disabled = true;

        setTimeout(() => {
            const newKey = generateLudoKey();
            generatedKeySpan.textContent = newKey;
            paymentForm.style.display = 'none';
            keyResultDiv.classList.remove('hidden');

            payButton.textContent = 'Оплатить и получить ключ';
            payButton.disabled = false;
        }, 1500);
    }

    // ---- копирование ключа ----
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

    // ---- Обработчики событий ----

    // Кастомный dropdown
    planSelectTrigger.addEventListener('click', toggleDropdown);

    planSelectOptions.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        planSelectOptions.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
        li.classList.add('selected');
        // Плавно меняем текст триггера
        animateTextChange(selectedPlanText, li.textContent);
        planSelect.value = li.dataset.value;
        updatePaymentAmount();
        closeDropdown();
    });

    document.addEventListener('click', (e) => {
        if (!planSelectWrapper.contains(e.target)) {
            closeDropdown();
        }
    });

    // Кнопки покупки
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

    // Закрытие модалки
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        paymentForm.style.display = 'block';
        keyResultDiv.classList.add('hidden');
        payButton.disabled = false;
        payButton.textContent = 'Оплатить и получить ключ';
        closeDropdown();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            paymentForm.style.display = 'block';
            keyResultDiv.classList.add('hidden');
            payButton.disabled = false;
            payButton.textContent = 'Оплатить и получить ключ';
            closeDropdown();
        }
    });

    paymentForm.addEventListener('submit', processPayment);
    copyBtn.addEventListener('click', copyKey);

    // Форматирование полей карты
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
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
        expiryInput.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '');
            if (val.length >= 2) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4);
            }
            this.value = val.slice(0, 5);
        });
    }

    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    // Инициализация заголовка модалки
    updateModalTitle();
})();