/**
 * SMART-ER 2.0 - AI Emergency Routing System
 * Complete JavaScript Implementation
 */

// ============================================
// Global State Management
// ============================================
const state = {
    currentLanguage: 'en',
    isDarkMode: false,
    isDisasterMode: false,
    isInternetConnected: true,
    currentSeverity: 0,
    selectedHospital: null,
    flowSimulationActive: false,
    alerts: [],
    hospitals: [
        { id: 1, name: 'Chennai GH', nameTa: 'சென்னை GH', lat: 13.0827, lng: 80.2707, totalICU: 50, availableICU: 12, distance: 8.5, eta: 12, type: 'trauma', status: 'available' },
        { id: 2, name: 'Madurai GH', nameTa: 'மதுரை GH', lat: 9.9252, lng: 78.1198, totalICU: 40, availableICU: 5, distance: 450, eta: 480, type: 'cardiac', status: 'limited' },
        { id: 3, name: 'Coimbatore GH', nameTa: 'கோயம்புத்தூர் GH', lat: 11.0168, lng: 76.9558, totalICU: 35, availableICU: 0, distance: 500, eta: 540, type: 'pediatric', status: 'full' },
        { id: 4, name: 'Trichy GH', nameTa: 'திருச்சி GH', lat: 10.7905, lng: 78.7047, totalICU: 30, availableICU: 8, distance: 320, eta: 360, type: 'trauma', status: 'available' }
    ],
    wards: [
        { id: 'trauma', name: 'Trauma ICU', nameTa: 'காயம் ICU', total: 20, occupied: 14, reserved: 2, available: 4, patients: [] },
        { id: 'pediatric', name: 'Pediatric ICU', nameTa: 'குழந்தை ICU', total: 15, occupied: 10, reserved: 1, available: 4, patients: [] },
        { id: 'cardiac', name: 'Cardiac ICU', nameTa: 'இதய ICU', total: 18, occupied: 16, reserved: 0, available: 2, patients: [] },
        { id: 'general', name: 'General Ward', nameTa: 'பொது வார்டு', total: 50, occupied: 35, reserved: 5, available: 10, patients: [] }
    ],
    demandChart: null
};

// Translations
const translations = {
    en: {
        systemNormal: 'System Normal',
        systemCritical: 'System Critical',
        analyzing: 'Analyzing...',
        recommendedGeneral: 'General Ward',
        recommendedICU: 'ICU Admission Required',
        recommendedTrauma: 'Trauma ICU',
        severityLow: 'Low Risk',
        severityModerate: 'Moderate Risk',
        severityHigh: 'High Risk',
        severityCritical: 'CRITICAL'
    },
    ta: {
        systemNormal: 'அமைப்பு இயல்பானது',
        systemCritical: 'அமைப்பு மிக முக்கியமானது',
        analyzing: 'பகுப்பாய்வு செய்கிறது...',
        recommendedGeneral: 'பொது வார்டு',
        recommendedICU: 'ICU அனுமதி தேவை',
        recommendedTrauma: 'காயம் ICU',
        severityLow: 'குறைந்த இடையீடு',
        severityModerate: 'மிதமான இடையீடு',
        severityHigh: 'உயர்ந்த இடையீடு',
        severityCritical: 'மிக முக்கியமான'
    }
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Simulate loading
    simulateLoading();
    
    // Initialize components
    setTimeout(() => {
        initMap();
        initChart();
        initWardDashboard();
        startRealtimeUpdates();
        animateCounters();
        
        // Start flow simulation automatically
        setTimeout(() => restartFlowSimulation(), 2000);
    }, 2500);
}

function simulateLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const progress = document.querySelector('.loading-progress');
    
    // Animate progress
    setTimeout(() => {
        progress.style.width = '100%';
    }, 100);
    
    // Hide loading screen
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);
}

// ============================================
// Language Toggle
// ============================================
function setLanguage(lang) {
    state.currentLanguage = lang;
    document.body.classList.toggle('lang-ta', lang === 'ta');
    
    // Update buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(lang === 'en' ? 'English' : 'தமிழ்')) {
            btn.classList.add('active');
        }
    });
    
    // Update all elements with data-en and data-ta attributes
    document.querySelectorAll('[data-en][data-ta]').forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = el.getAttribute(`data-${lang}`);
            el.style.opacity = '1';
        }, 150);
    });
    
    // Update dynamic content
    updateDynamicContent();
}

function updateDynamicContent() {
    // Update hospital names in map
    if (state.selectedHospital) {
        document.getElementById('hospitalName').textContent = 
            state.currentLanguage === 'en' ? state.selectedHospital.name : state.selectedHospital.nameTa;
    }
    
    // Update ward names
    renderWardDashboard();
    
    // Update status text
    updateSystemStatus();
}

// ============================================
// Dark Mode Toggle
// ============================================
function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    
    const icon = document.querySelector('#themeToggle i');
    icon.className = state.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    
    // Update chart colors if exists
    if (state.demandChart) {
        updateChartTheme();
    }
}

// ============================================
// Disaster Mode Toggle
// ============================================
function toggleDisasterMode() {
    state.isDisasterMode = !state.isDisasterMode;
    document.body.classList.toggle('disaster-mode', state.isDisasterMode);
    
    const btn = document.getElementById('disasterToggle');
    btn.classList.toggle('active', state.isDisasterMode);
    
    // Update floating status
    updateSystemStatus();
    
    // Trigger disaster effects
    if (state.isDisasterMode) {
        activateDisasterEffects();
    } else {
        deactivateDisasterEffects();
    }
}

function activateDisasterEffects() {
    // Increase severity
    simulateCriticalPatient();
    
    // Update chart with spike
    updateChartForDisaster();
    
    // Show warning
    showNotification('Disaster Mode Activated', 'Emergency protocols engaged. All hospitals on high alert.', 'admin');
    
    // Change map markers
    updateMapForDisaster();
}

function deactivateDisasterEffects() {
    // Reset to normal
    simulateRandomPatient();
    updateChartForNormal();
    updateMapForNormal();
}

// ============================================
// Voice Input (Simulated)
// ============================================
function toggleVoiceInput() {
    const btn = document.querySelector('.voice-btn');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        btn.style.background = 'var(--danger)';
        btn.style.color = 'white';
        showNotification('Voice Input', 'Listening for emergency commands...', 'admin');
        
        setTimeout(() => {
            btn.classList.remove('active');
            btn.style.background = '';
            btn.style.color = '';
            showNotification('Voice Input', 'Command received: "Route to nearest trauma center"', 'admin');
        }, 3000);
    }
}

// ============================================
// Mobile Menu
// ============================================
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
}

// ============================================
// Hero Stats Animation
// ============================================
function animateCounters() {
    const stats = [
        { id: 'statHospitals', target: 156, suffix: '' },
        { id: 'statBeds', target: 1243, suffix: '' },
        { id: 'statResponse', target: 4.2, suffix: 'm', decimals: 1 },
        { id: 'statSaved', target: 28, suffix: '' }
    ];
    
    stats.forEach(stat => {
        animateValue(stat.id, 0, stat.target, 2000, stat.suffix, stat.decimals || 0);
    });
}

function animateValue(id, start, end, duration, suffix = '', decimals = 0) {
    const obj = document.getElementById(id);
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    
    let startTime = new Date().getTime();
    let endTime = startTime + duration;
    let timer;
    
    function run() {
        let now = new Date().getTime();
        let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        let displayValue = decimals > 0 ? (value / 10).toFixed(decimals) : value;
        obj.innerHTML = displayValue + suffix;
        if (value == end) {
            clearInterval(timer);
        }
    }
    
    timer = setInterval(run, stepTime);
    run();
}

// ============================================
// Live Emergency Flow Simulation
// ============================================
let flowInterval;
let currentStep = 0;

function restartFlowSimulation() {
    // Reset
    currentStep = 0;
    clearInterval(flowInterval);
    
    // Reset UI
    document.querySelectorAll('.timeline-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    document.getElementById('ambulanceIcon').style.left = '10%';
    document.getElementById('severityDisplay').textContent = '--';
    
    // Start simulation
    simulateFlowStep();
}

function simulateFlowStep() {
    const steps = document.querySelectorAll('.timeline-step');
    const ambulance = document.getElementById('ambulanceIcon');
    
    flowInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
            // Complete current step
            steps[currentStep].classList.remove('active');
            steps[currentStep].classList.add('completed');
            
            // Update timestamp
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
            steps[currentStep].querySelector('.step-time').textContent = timeStr;
            
            // Activate next step
            currentStep++;
            steps[currentStep].classList.add('active');
            
            // Move ambulance
            const progress = (currentStep / (steps.length - 1)) * 80 + 10;
            ambulance.style.left = progress + '%';
            
            // Update ETA
            const eta = Math.max(0, 12 - (currentStep * 2));
            document.getElementById('etaTimer').textContent = `00:${eta.toString().padStart(2, '0')}`;
            
            // Trigger severity calculation at step 2
            if (currentStep === 1) {
                setTimeout(() => simulateRandomPatient(), 500);
            }
            
            // Trigger SMS at final step
            if (currentStep === steps.length - 1) {
                setTimeout(() => {
                    if (state.currentSeverity > 70) {
                        triggerAlert('doctor');
                        triggerAlert('nurse');
                    }
                }, 500);
            }
        } else {
            clearInterval(flowInterval);
        }
    }, 2000);
}

// ============================================
// AI Severity Dashboard
// ============================================
function simulateSeverity(vitals) {
    // Calculate severity score based on vitals
    let score = 0;
    
    // Heart rate (60-100 normal)
    if (vitals.heartRate < 50 || vitals.heartRate > 120) score += 25;
    else if (vitals.heartRate < 60 || vitals.heartRate > 100) score += 15;
    
    // Blood pressure (120/80 normal)
    const [systolic, diastolic] = vitals.bp.split('/').map(Number);
    if (systolic > 180 || systolic < 90 || diastolic > 110 || diastolic < 60) score += 25;
    else if (systolic > 140 || systolic < 110 || diastolic > 90 || diastolic < 70) score += 15;
    
    // SpO2 (95-100 normal)
    if (vitals.spo2 < 90) score += 25;
    else if (vitals.spo2 < 95) score += 15;
    
    // Temperature (36.5-37.5 normal)
    if (vitals.temp > 39 || vitals.temp < 35) score += 25;
    else if (vitals.temp > 38 || vitals.temp < 36) score += 10;
    
    // Cap at 100
    score = Math.min(100, score);
    
    // Add some randomness
    score = Math.min(100, Math.max(0, score + (Math.random() * 10 - 5)));
    
    updateSeverityDisplay(Math.round(score));
    return Math.round(score);
}

function updateSeverityDisplay(score) {
    state.currentSeverity = score;
    
    // Animate meter
    const needle = document.getElementById('meterNeedle');
    const meterFill = document.getElementById('meterFill');
    const scoreDisplay = document.getElementById('severityScore');
    
    // Calculate rotation (-90 to 90 degrees)
    const rotation = -90 + (score / 100) * 180;
    needle.style.transform = `rotate(${rotation}deg)`;
    needle.style.transformOrigin = '100px 100px';
    
    // Update fill arc
    const endAngle = -90 + (score / 100) * 180;
    const endRadians = (endAngle * Math.PI) / 180;
    const endX = 100 + 80 * Math.cos(endRadians);
    const endY = 100 + 80 * Math.sin(endRadians);
    const largeArcFlag = score > 50 ? 1 : 0;
    
    const pathData = `M 20 100 A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    meterFill.setAttribute('d', pathData);
    
    // Animate score counter
    animateValue('severityScore', 0, score, 1000, '', 0);
    
    // Update color based on severity
    let color = '#16a34a'; // Green
    let icuRisk = score * 0.8;
    let recommendation = translations[state.currentLanguage].recommendedGeneral;
    let ward = 'General Ward';
    
    if (score > 70) {
        color = '#dc2626'; // Red
        recommendation = translations[state.currentLanguage].recommendedICU;
        ward = 'ICU Admission';
        document.getElementById('recommendationBox').style.borderLeftColor = '#dc2626';
        document.getElementById('recommendationBox').style.background = 'rgba(220, 38, 38, 0.1)';
    } else if (score > 40) {
        color = '#f59e0b'; // Orange
        recommendation = translations[state.currentLanguage].recommendedTrauma;
        ward = 'Trauma ICU';
        document.getElementById('recommendationBox').style.borderLeftColor = '#f59e0b';
        document.getElementById('recommendationBox').style.background = 'rgba(245, 158, 11, 0.1)';
    } else {
        document.getElementById('recommendationBox').style.borderLeftColor = '#16a34a';
        document.getElementById('recommendationBox').style.background = 'rgba(22, 163, 74, 0.1)';
    }
    
    needle.style.stroke = color;
    scoreDisplay.style.color = color;
    
    // Update indicators
    document.getElementById('icuRiskValue').textContent = Math.round(icuRisk) + '%';
    document.getElementById('icuRiskBar').style.width = icuRisk + '%';
    document.getElementById('icuRiskBar').style.background = color;
    
    const confidence = 85 + Math.random() * 10;
    document.getElementById('confidenceValue').textContent = Math.round(confidence) + '%';
    document.getElementById('confidenceBar').style.width = confidence + '%';
    
    document.getElementById('wardRecommendation').textContent = recommendation;
    
    // Update severity display in flow
    document.getElementById('severityDisplay').textContent = score;
    document.getElementById('severityDisplay').style.color = color;
    
    // Add log entry
    addAILog(`Severity calculated: ${score}/100 - ${ward} recommended`);
    
    // Trigger alerts if critical
    if (score > 70 && !state.alerts.includes('critical')) {
        state.alerts.push('critical');
        setTimeout(() => triggerAlert('doctor'), 500);
    }
}

function simulateRandomPatient() {
    const vitals = {
        heartRate: Math.floor(60 + Math.random() * 40),
        bp: `${Math.floor(110 + Math.random() * 30)}/${Math.floor(70 + Math.random() * 20)}`,
        spo2: Math.floor(95 + Math.random() * 5),
        temp: (36 + Math.random() * 2).toFixed(1)
    };
    
    // Update vital displays
    updateVitalDisplay('heartRate', vitals.heartRate, 'bpm', 60, 100);
    updateVitalDisplay('bloodPressure', vitals.bp, 'mmHg', 110, 140, true);
    updateVitalDisplay('spo2', vitals.spo2, '%', 95, 100);
    updateVitalDisplay('temperature', vitals.temp, '°C', 36, 37.5);
    
    // Calculate severity
    simulateSeverity(vitals);
}

function simulateCriticalPatient() {
    const vitals = {
        heartRate: Math.floor(130 + Math.random() * 20),
        bp: `${Math.floor(160 + Math.random() * 30)}/${Math.floor(100 + Math.random() * 20)}`,
        spo2: Math.floor(85 + Math.random() * 8),
        temp: (38.5 + Math.random() * 1.5).toFixed(1)
    };
    
    updateVitalDisplay('heartRate', vitals.heartRate, 'bpm', 60, 100, true);
    updateVitalDisplay('bloodPressure', vitals.bp, 'mmHg', 110, 140, true);
    updateVitalDisplay('spo2', vitals.spo2, '%', 95, 100, true);
    updateVitalDisplay('temperature', vitals.temp, '°C', 36, 37.5, true);
    
    simulateSeverity(vitals);
}

function updateVitalDisplay(id, value, unit, min, max, isAlert = false) {
    const element = document.getElementById(id);
    const card = element.closest('.vital-card');
    
    element.textContent = value;
    
    // Remove previous alert classes
    card.classList.remove('alert', 'warning');
    
    // Check if value is out of range (simplified logic)
    let numericValue = parseFloat(value);
    if (id === 'bloodPressure') {
        numericValue = parseInt(value.split('/')[0]); // Use systolic
    }
    
    if (isAlert || numericValue < min || numericValue > max) {
        card.classList.add('alert');
    }
}

function addAILog(message) {
    const logContainer = document.getElementById('aiLog');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-text">${message}</span>
    `;
    
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Keep only last 5 entries
    while (logContainer.children.length > 5) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// ============================================
// Leaflet Map Implementation
// ============================================
let map;
let markers = [];

function initMap() {
    // Initialize map centered on Tamil Nadu
    map = L.map('tnMap').setView([10.8, 78.5], 7);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add hospital markers
    state.hospitals.forEach(hospital => {
        const color = hospital.availableICU > 5 ? '#16a34a' : 
                     hospital.availableICU > 0 ? '#f59e0b' : '#dc2626';
        
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 30px;
                height: 30px;
                background: ${color};
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                animation: ${hospital.availableICU === 0 ? 'blink 2s infinite' : 'none'};
            "><i class="fas fa-hospital"></i></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([hospital.lat, hospital.lng], { icon }).addTo(map);
        
        marker.on('click', () => selectHospital(hospital));
        markers.push(marker);
    });
}

function selectHospital(hospital) {
    state.selectedHospital = hospital;
    
    const card = document.getElementById('selectedHospitalCard');
    card.classList.add('active');
    
    document.getElementById('hospitalName').textContent = 
        state.currentLanguage === 'en' ? hospital.name : hospital.nameTa;
    
    const statusEl = document.getElementById('hospitalStatus');
    statusEl.textContent = hospital.availableICU > 0 ? 'Available' : 'Full';
    statusEl.className = 'hospital-status ' + (hospital.availableICU > 0 ? 'available' : 'full');
    
    document.getElementById('totalICU').textContent = hospital.totalICU;
    document.getElementById('availableICU').textContent = hospital.availableICU;
    document.getElementById('hospitalDistance').textContent = hospital.distance + ' km';
    document.getElementById('hospitalETA').textContent = Math.floor(hospital.eta / 60) + ' min';
    
    document.getElementById('reserveBtn').disabled = hospital.availableICU === 0;
    
    // Update target in flow
    document.getElementById('targetHospital').textContent = 
        state.currentLanguage === 'en' ? hospital.name : hospital.nameTa;
}

function filterHospitals() {
    const showAvailableOnly = document.getElementById('availableToggle').checked;
    const icuType = document.getElementById('icuTypeFilter').value;
    
    markers.forEach((marker, index) => {
        const hospital = state.hospitals[index];
        let visible = true;
        
        if (showAvailableOnly && hospital.availableICU === 0) {
            visible = false;
        }
        
        if (icuType !== 'all' && hospital.type !== icuType) {
            visible = false;
        }
        
        if (visible) {
            marker.addTo(map);
        } else {
            marker.remove();
        }
    });
}

function locateNearestHospital() {
    // Simulate finding nearest hospital (Chennai GH for demo)
    const nearest = state.hospitals[0];
    map.setView([nearest.lat, nearest.lng], 10);
    selectHospital(nearest);
    
    // Add circle animation
    L.circle([nearest.lat, nearest.lng], {
        color: '#0f766e',
        fillColor: '#0f766e',
        fillOpacity: 0.1,
        radius: 5000
    }).addTo(map).bindPopup('Nearest Available Hospital').openPopup();
}

function reserveBedFromMap() {
    if (state.selectedHospital && state.selectedHospital.availableICU > 0) {
        state.selectedHospital.availableICU--;
        state.selectedHospital.reserved = (state.selectedHospital.reserved || 0) + 1;
        
        selectHospital(state.selectedHospital);
        showNotification('Bed Reserved', `ICU bed reserved at ${state.selectedHospital.name}`, 'admin');
        addAILog(`Bed reserved at ${state.selectedHospital.name}`);
        
        // Update ward dashboard
        updateWardStats();
    }
}

function updateMapForDisaster() {
    // Change all markers to red
    markers.forEach((marker, index) => {
        const hospital = state.hospitals[index];
        hospital.availableICU = Math.max(0, hospital.availableICU - 5);
        
        marker.setIcon(L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 35px;
                height: 35px;
                background: #dc2626;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                animation: blink 1s infinite;
            "><i class="fas fa-exclamation"></i></div>`,
            iconSize: [35, 35],
            iconAnchor: [17, 17]
        }));
    });
}

function updateMapForNormal() {
    // Reset markers
    markers.forEach((marker, index) => {
        const hospital = state.hospitals[index];
        const color = hospital.availableICU > 5 ? '#16a34a' : 
                     hospital.availableICU > 0 ? '#f59e0b' : '#dc2626';
        
        marker.setIcon(L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 30px;
                height: 30px;
                background: ${color};
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
            "><i class="fas fa-hospital"></i></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        }));
    });
}

// ============================================
// Smart Bed Dashboard
// ============================================
function initWardDashboard() {
    renderWardDashboard();
    updateWardStats();
}

function renderWardDashboard() {
    const grid = document.getElementById('wardGrid');
    grid.innerHTML = '';
    
    state.wards.forEach(ward => {
        const card = document.createElement('div');
        card.className = 'ward-card glass';
        card.onclick = () => openWardModal(ward);
        
        const status = ward.available > 5 ? 'available' : ward.available > 0 ? 'limited' : 'full';
        const statusText = state.currentLanguage === 'en' ? 
            (status === 'available' ? 'Available' : status === 'limited' ? 'Limited' : 'Full') :
            (status === 'available' ? 'கிடைக்கும்' : status === 'limited' ? 'குறைந்த' : 'நிரம்பியது');
        
        card.innerHTML = `
            <div class="ward-header">
                <span class="ward-name">${state.currentLanguage === 'en' ? ward.name : ward.nameTa}</span>
                <span class="ward-status ${status}">${statusText}</span>
            </div>
            <div class="ward-beds">
                ${generateBedIcons(ward)}
            </div>
            <div class="ward-stats">
                <div class="ward-stat">
                    <span class="ward-stat-value">${ward.total}</span>
                    <span class="ward-stat-label">Total</span>
                </div>
                <div class="ward-stat">
                    <span class="ward-stat-value" style="color: var(--danger)">${ward.occupied}</span>
                    <span class="ward-stat-label">Occupied</span>
                </div>
                <div class="ward-stat">
                    <span class="ward-stat-value" style="color: var(--warning)">${ward.reserved}</span>
                    <span class="ward-stat-label">Reserved</span>
                </div>
                <div class="ward-stat">
                    <span class="ward-stat-value" style="color: var(--success)">${ward.available}</span>
                    <span class="ward-stat-label">Available</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function generateBedIcons(ward) {
    let html = '';
    const total = Math.min(ward.total, 10); // Show max 10 icons
    
    for (let i = 0; i < total; i++) {
        let status = 'available';
        if (i < ward.occupied) status = 'occupied';
        else if (i < ward.occupied + ward.reserved) status = 'reserved';
        
        html += `<div class="bed-icon ${status}"><i class="fas fa-bed"></i></div>`;
    }
    
    return html;
}

function updateWardStats() {
    const total = state.wards.reduce((sum, w) => sum + w.total, 0);
    const occupied = state.wards.reduce((sum, w) => sum + w.occupied, 0);
    const reserved = state.wards.reduce((sum, w) => sum + w.reserved, 0);
    const available = state.wards.reduce((sum, w) => sum + w.available, 0);
    
    animateValue('totalBeds', 0, total, 1000, '', 0);
    animateValue('occupiedBeds', 0, occupied, 1000, '', 0);
    animateValue('reservedBeds', 0, reserved, 1000, '', 0);
    animateValue('availableBeds', 0, available, 1000, '', 0);
}

function openWardModal(ward) {
    const modal = document.getElementById('patientModal');
    const body = document.getElementById('modalBody');
    
    modal.classList.add('active');
    
    // Generate mock patients
    const patients = [];
    for (let i = 0; i < ward.occupied; i++) {
        patients.push({
            name: `Patient ${i + 1}`,
            age: Math.floor(30 + Math.random() * 50),
            condition: ['Stable', 'Critical', 'Recovering'][Math.floor(Math.random() * 3)],
            admissionTime: new Date(Date.now() - Math.random() * 86400000).toLocaleString()
        });
    }
    
    body.innerHTML = `
        <div class="ward-detail">
            <h4>${state.currentLanguage === 'en' ? ward.name : ward.nameTa}</h4>
            <div class="patient-list">
                ${patients.map(p => `
                    <div class="patient-item">
                        <div class="patient-info">
                            <strong>${p.name}</strong>
                            <span>Age: ${p.age} | ${p.condition}</span>
                        </div>
                        <span class="admission-time">${p.admissionTime}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function closePatientModal() {
    document.getElementById('patientModal').classList.remove('active');
}

// ============================================
// ICU Demand Prediction Chart
// ============================================
function initChart() {
    const ctx = document.getElementById('demandChart').getContext('2d');
    
    const hours = [];
    const actualData = [];
    const predictedData = [];
    
    for (let i = 0; i < 12; i++) {
        hours.push(`${i + 1}h`);
        actualData.push(i < 6 ? 60 + Math.random() * 20 : null);
        predictedData.push(65 + Math.random() * 25 + (i > 6 ? 10 : 0));
    }
    
    state.demandChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Actual',
                data: actualData,
                borderColor: '#0f766e',
                backgroundColor: 'rgba(15, 118, 110, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }, {
                label: 'Predicted',
                data: predictedData,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                borderDash: [5, 5],
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function updateChartTheme() {
    if (!state.demandChart) return;
    
    const textColor = state.isDarkMode ? '#f8fafc' : '#1e293b';
    const gridColor = state.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    
    state.demandChart.options.scales.y.grid.color = gridColor;
    state.demandChart.options.scales.x.ticks.color = textColor;
    state.demandChart.options.scales.y.ticks.color = textColor;
    state.demandChart.update();
}

function updateChartForDisaster() {
    if (!state.demandChart) return;
    
    // Spike the prediction
    const newData = state.demandChart.data.datasets[1].data.map((val, i) => 
        i > 6 ? 85 + Math.random() * 15 : val
    );
    
    state.demandChart.data.datasets[1].data = newData;
    state.demandChart.update();
    
    // Show warning
    document.getElementById('predictionWarning').style.display = 'flex';
    document.getElementById('peakLoad').textContent = '94%';
    document.getElementById('staffNeeded').textContent = '+12';
}

function updateChartForNormal() {
    if (!state.demandChart) return;
    
    document.getElementById('predictionWarning').style.display = 'none';
    document.getElementById('peakLoad').textContent = '72%';
    document.getElementById('staffNeeded').textContent = '+3';
}

function updateICUPrediction() {
    if (!state.demandChart) return;
    
    // Simulate real-time update
    const lastIndex = 5;
    const newValue = 60 + Math.random() * 20;
    state.demandChart.data.datasets[0].data[lastIndex] = newValue;
    state.demandChart.update('none');
}

// ============================================
// SMS Alert System
// ============================================
function triggerAlert(type) {
    const notificationList = document.getElementById('notificationList');
    
    // Remove empty state if exists
    const emptyState = notificationList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const alerts = {
        doctor: {
            title: 'Dr. Kumar - Emergency',
            message: 'Critical patient incoming. Trauma ICU needed.',
            icon: 'fa-user-md',
            color: '#dc2626'
        },
        nurse: {
            title: 'Head Nurse - Alert',
            message: 'Please prepare ICU bed #12 immediately.',
            icon: 'fa-user-nurse',
            color: '#0f766e'
        },
        admin: {
            title: 'System Administrator',
            message: 'Network status updated. All systems operational.',
            icon: 'fa-user-shield',
            color: '#f59e0b'
        }
    };
    
    const alert = alerts[type];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const card = document.createElement('div');
    card.className = `notification-card ${type}`;
    card.innerHTML = `
        <div class="notification-header">
            <span class="notification-type" style="color: ${alert.color}">${type}</span>
            <span class="notification-time">${timeStr}</span>
        </div>
        <div class="notification-title">${alert.title}</div>
        <div class="notification-message">${alert.message}</div>
        <div class="notification-actions">
            <button class="btn-acknowledge" onclick="acknowledgeAlert(this)">Acknowledge</button>
        </div>
    `;
    
    notificationList.insertBefore(card, notificationList.firstChild);
    
    // Play sound effect (simulated)
    addAILog(`SMS Alert sent to ${type}`);
}

function acknowledgeAlert(btn) {
    btn.textContent = 'Acknowledged';
    btn.style.background = '#16a34a';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.closest('.notification-card').style.opacity = '0.5';
    }, 500);
}

function updateThreshold() {
    const value = document.getElementById('severityThreshold').value;
    document.getElementById('thresholdValue').textContent = value;
}

// ============================================
// Mesh Network Visualization
// ============================================
function simulateInternetFailure() {
    state.isInternetConnected = false;
    
    document.getElementById('networkStatus').innerHTML = `
        <span class="status-dot offline"></span>
        <span>Offline Mode Active</span>
    `;
    
    // Activate mesh lines
    document.querySelectorAll('.mesh-line').forEach(line => {
        line.classList.add('active');
    });
    
    document.querySelectorAll('.data-packet').forEach(packet => {
        packet.classList.add('active');
    });
    
    // Update node statuses
    document.querySelectorAll('.node-status').forEach(status => {
        status.textContent = 'Mesh Mode';
        status.style.fill = '#f59e0b';
    });
    
    addAILog('Internet connection lost. Switched to mesh network mode.');
    showNotification('Network Alert', 'Internet connection failed. Mesh network activated.', 'admin');
}

function restoreInternet() {
    state.isInternetConnected = true;
    
    document.getElementById('networkStatus').innerHTML = `
        <span class="status-dot online"></span>
        <span>Internet Connected</span>
    `;
    
    document.querySelectorAll('.mesh-line').forEach(line => {
        line.classList.remove('active');
    });
    
    document.querySelectorAll('.data-packet').forEach(packet => {
        packet.classList.remove('active');
    });
    
    document.querySelectorAll('.node-status').forEach(status => {
        status.textContent = 'Online';
        status.style.fill = '#16a34a';
    });
    
    addAILog('Internet connection restored. Normal operations resumed.');
}

// ============================================
// System Status & Utilities
// ============================================
function updateSystemStatus() {
    const statusEl = document.getElementById('floatingStatus');
    const textEl = document.getElementById('statusText');
    const indicator = statusEl.querySelector('.status-indicator');
    
    if (state.isDisasterMode) {
        textEl.textContent = translations[state.currentLanguage].systemCritical;
        indicator.className = 'status-indicator red';
    } else {
        textEl.textContent = translations[state.currentLanguage].systemNormal;
        indicator.className = 'status-indicator green';
    }
}

function showNotification(title, message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 1rem;
        max-width: 300px;
        z-index: 3000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    `;
    
    const colors = {
        info: '#0f766e',
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626'
    };
    
    toast.innerHTML = `
        <div style="display: flex; align-items: start; gap: 0.75rem;">
            <i class="fas fa-info-circle" style="color: ${colors[type] || colors.info}; margin-top: 2px;"></i>
            <div>
                <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--text-primary);">${title}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${message}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ============================================
// Real-time Updates
// ============================================
function startRealtimeUpdates() {
    // Update vitals every 5 seconds
    setInterval(() => {
        if (Math.random() > 0.7) {
            const heartRate = 60 + Math.floor(Math.random() * 40);
            document.getElementById('heartRate').textContent = heartRate;
        }
    }, 5000);
    
    // Update chart every 10 seconds
    setInterval(() => {
        updateICUPrediction();
    }, 10000);
    
    // Random bed updates
    setInterval(() => {
        if (Math.random() > 0.8) {
            const ward = state.wards[Math.floor(Math.random() * state.wards.length)];
            if (Math.random() > 0.5 && ward.available > 0) {
                ward.available--;
                ward.occupied++;
            } else if (ward.occupied > 0) {
                ward.available++;
                ward.occupied--;
            }
            renderWardDashboard();
            updateWardStats();
        }
    }, 15000);
}

// ============================================
// Smooth Scroll for Navigation
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Close modal on outside click
document.getElementById('patientModal').addEventListener('click', (e) => {
    if (e.target.id === 'patientModal') {
        closePatientModal();
    }
});

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(20px); }
    }
`;
document.head.appendChild(style);