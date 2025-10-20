// Data Analytics Consulting Website - Main JavaScript
// Professional interactions and animations

class DataAnalyticsWebsite {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.initializeAnimations();
    }

    init() {
        // Initialize core functionality
        this.currentPage = this.getCurrentPage();
        this.analyticsData = this.initializeAnalytics();
        this.formData = {};
        
        // Track page view
        this.trackEvent('page_view', {
            page: this.currentPage,
            timestamp: new Date().toISOString()
        });
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('services')) return 'services';
        if (path.includes('case-studies')) return 'case-studies';
        if (path.includes('blog')) return 'blog';
        return 'home';
    }

    setupEventListeners() {
        // Navigation interactions
        this.setupNavigation();
        
        // Form handling
        this.setupForms();
        
        // Interactive components
        this.setupROICalculator();
        this.setupCaseStudyFilters();
        this.setupDemoDashboard();
        
        // Scroll animations
        this.setupScrollAnimations();
        
        // Analytics tracking
        this.setupAnalyticsTracking();
    }

    setupNavigation() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                this.trackEvent('mobile_menu_toggle');
            });
        }

        // Active navigation highlighting
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    setupForms() {
        // Consultation form handling
        const consultationForm = document.querySelector('#consultation-form');
        if (consultationForm) {
            this.setupConsultationForm(consultationForm);
        }

        // Newsletter signup
        const newsletterForm = document.querySelector('#newsletter-form');
        if (newsletterForm) {
            this.setupNewsletterForm(newsletterForm);
        }

        // Contact forms
        document.querySelectorAll('.contact-form').forEach(form => {
            this.setupContactForm(form);
        });
    }

    setupConsultationForm(form) {
        const steps = form.querySelectorAll('.form-step');
        const nextBtns = form.querySelectorAll('.next-step');
        const prevBtns = form.querySelectorAll('.prev-step');
        const progressBar = form.querySelector('.progress-bar');
        let currentStep = 0;

        const updateProgress = () => {
            const progress = ((currentStep + 1) / steps.length) * 100;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        };

        const showStep = (stepIndex) => {
            steps.forEach((step, index) => {
                step.classList.toggle('active', index === stepIndex);
            });
            updateProgress();
        };

        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.validateStep(steps[currentStep])) {
                    if (currentStep < steps.length - 1) {
                        currentStep++;
                        showStep(currentStep);
                        this.trackEvent('form_step_completed', { step: currentStep });
                    }
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleConsultationSubmit(form);
        });

        showStep(0);
    }

    validateStep(step) {
        const requiredFields = step.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        const error = document.createElement('div');
        error.className = 'field-error text-red-500 text-sm mt-1';
        error.textContent = message;
        field.parentNode.appendChild(error);
        field.classList.add('border-red-500');
    }

    clearFieldError(field) {
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        field.classList.remove('border-red-500');
    }

    async handleConsultationSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateApiCall(data);
            
            // Show success message
            this.showFormSuccess(form);
            this.trackEvent('consultation_request_submitted', data);
            
        } catch (error) {
            this.showFormError(form, 'Failed to submit form. Please try again.');
            this.trackEvent('form_submission_error', { error: error.message });
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showFormSuccess(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4';
        successMessage.innerHTML = `
            <strong>Thank you!</strong> Your consultation request has been submitted.
            We'll contact you within 24 hours to schedule your free consultation.
        `;
        form.appendChild(successMessage);
        form.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }

    showFormError(form, message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4';
        errorMessage.innerHTML = `<strong>Error:</strong> ${message}`;
        form.appendChild(errorMessage);
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }

    setupROICalculator() {
        const calculator = document.querySelector('#roi-calculator');
        if (!calculator) return;

        const inputs = calculator.querySelectorAll('.roi-input');
        const results = calculator.querySelector('.roi-results');
        const chart = calculator.querySelector('#roi-chart');

        const calculateROI = () => {
            const revenue = parseFloat(calculator.querySelector('#revenue')?.value) || 0;
            const employees = parseFloat(calculator.querySelector('#employees')?.value) || 0;
            const reportingHours = parseFloat(calculator.querySelector('#reporting-hours')?.value) || 0;
            const industry = calculator.querySelector('#industry')?.value || 'general';

            // ROI calculation logic
            const hourlyRate = revenue / (employees * 2000); // Assuming 2000 hours/year
            const currentCost = reportingHours * hourlyRate * employees;
            const efficiencyGain = this.getIndustryMultiplier(industry);
            const annualSavings = currentCost * efficiencyGain;
            const roiPercentage = ((annualSavings / (revenue * 0.02)) * 100); // Assuming 2% investment

            this.displayROIRResults({
                currentCost,
                annualSavings,
                roiPercentage,
                paybackMonths: Math.ceil(12 / efficiencyGain)
            });

            this.updateROIChart(annualSavings, industry);
            this.trackEvent('roi_calculator_used', { industry, revenue });
        };

        inputs.forEach(input => {
            input.addEventListener('input', this.debounce(calculateROI, 500));
        });

        // Initial calculation
        calculateROI();
    }

    getIndustryMultiplier(industry) {
        const multipliers = {
            'manufacturing': 0.35,
            'healthcare': 0.40,
            'financial': 0.45,
            'retail': 0.30,
            'technology': 0.50,
            'general': 0.25
        };
        return multipliers[industry] || multipliers.general;
    }

    displayROIRResults(results) {
        const container = document.querySelector('.roi-results');
        if (!container) return;

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">$${this.formatNumber(results.annualSavings)}</div>
                    <div class="text-sm text-gray-600">Annual Savings</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">${Math.round(results.roiPercentage)}%</div>
                    <div class="text-sm text-gray-600">ROI</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">${results.paybackMonths}</div>
                    <div class="text-sm text-gray-600">Months to Payback</div>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600">$${this.formatNumber(results.currentCost)}</div>
                    <div class="text-sm text-gray-600">Current Annual Cost</div>
                </div>
            </div>
        `;
    }

    updateROIChart(annualSavings, industry) {
        const chartContainer = document.querySelector('#roi-chart');
        if (!chartContainer || typeof echarts === 'undefined') return;

        const chart = echarts.init(chartContainer);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlySavings = annualSavings / 12;
        const cumulativeSavings = months.map((_, index) => monthlySavings * (index + 1));

        const option = {
            title: {
                text: 'Projected ROI Over 12 Months',
                textStyle: { color: '#2d3748', fontSize: 16 }
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}: ${c}'
            },
            xAxis: {
                type: 'category',
                data: months
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '${value}'
                }
            },
            series: [{
                data: cumulativeSavings,
                type: 'line',
                smooth: true,
                itemStyle: { color: '#3182ce' },
                areaStyle: { color: 'rgba(49, 130, 206, 0.1)' }
            }]
        };

        chart.setOption(option);
    }

    setupCaseStudyFilters() {
        const filters = document.querySelectorAll('.case-study-filter');
        const studies = document.querySelectorAll('.case-study-card');

        filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                const filterValue = filter.dataset.filter;
                
                // Update active filter
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                // Filter studies
                studies.forEach(study => {
                    const studyCategories = study.dataset.categories.split(',');
                    const shouldShow = filterValue === 'all' || studyCategories.includes(filterValue);
                    
                    study.style.display = shouldShow ? 'block' : 'none';
                    
                    if (shouldShow) {
                        study.classList.add('animate-fade-in');
                    }
                });
                
                this.trackEvent('case_study_filter_used', { filter: filterValue });
            });
        });
    }

    setupDemoDashboard() {
        const dashboard = document.querySelector('#demo-dashboard');
        if (!dashboard || typeof echarts === 'undefined') return;

        // Initialize demo charts
        this.initDemoChart('sales-chart', 'Sales Performance');
        this.initDemoChart('operations-chart', 'Operations Metrics');
        this.initDemoChart('finance-chart', 'Financial KPIs');
        
        // Tab switching
        const tabs = dashboard.querySelectorAll('.dashboard-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetChart = tab.dataset.chart;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show target chart
                dashboard.querySelectorAll('.chart-container').forEach(chart => {
                    chart.classList.toggle('active', chart.id === targetChart);
                });
                
                this.trackEvent('demo_dashboard_tab_switched', { chart: targetChart });
            });
        });
    }

    initDemoChart(containerId, title) {
        const container = document.querySelector(`#${containerId}`);
        if (!container) return;

        const chart = echarts.init(container);
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        const option = {
            title: {
                text: title,
                textStyle: { 
                    color: isDarkMode ? '#ffffff' : '#2d3748',
                    fontSize: 14 
                }
            },
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
            },
            yAxis: { type: 'value' },
            series: [{
                data: [120, 200, 150, 80, 70, 110],
                type: 'bar',
                itemStyle: { color: '#3182ce' }
            }]
        };

        chart.setOption(option);
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger specific animations
                    if (entry.target.classList.contains('counter')) {
                        this.animateCounter(entry.target);
                    }
                    
                    if (entry.target.classList.contains('chart-container')) {
                        this.animateChart(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    }

    animateChart(element) {
        // Add chart animation logic here
        element.classList.add('chart-animated');
    }

    setupAnalyticsTracking() {
        // Track CTA clicks
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const ctaType = button.dataset.cta || 'generic';
                this.trackEvent('cta_click', { 
                    type: ctaType,
                    page: this.currentPage 
                });
            });
        });

        // Track external links
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackEvent('external_link_click', {
                    url: link.href,
                    page: this.currentPage
                });
            });
        });

        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.trackEvent('page_time_spent', {
                duration: timeSpent,
                page: this.currentPage
            });
        });
    }

    initializeAnimations() {
        // Initialize typewriter effect for hero text
        const heroText = document.querySelector('.hero-typewriter');
        if (heroText && typeof Typed !== 'undefined') {
            new Typed(heroText, {
                strings: [
                    'Transform Data Into Strategic Advantage',
                    'Unlock Insights That Drive Growth',
                    'Make Data-Driven Decisions With Confidence'
                ],
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }

        // Initialize particle animation for hero background
        this.initParticleAnimation();
    }

    initParticleAnimation() {
        const canvas = document.querySelector('#particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(49, 130, 206, 0.3)';
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toFixed(0);
    }

    simulateApiCall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, data });
            }, 1500);
        });
    }

    trackEvent(eventName, properties = {}) {
        // Simulate analytics tracking
        console.log('Analytics Event:', eventName, properties);
        
        // In production, this would send to your analytics service
        // Example: gtag('event', eventName, properties);
    }

    initializeAnalytics() {
        return {
            pageViews: 0,
            events: [],
            conversions: 0,
            sessionStart: new Date()
        };
    }
}

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DataAnalyticsWebsite();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pause animations');
    } else {
        console.log('Page visible - resume animations');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Recalculate layouts and animations
    const event = new Event('resize');
    document.dispatchEvent(event);
});