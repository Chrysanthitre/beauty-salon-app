// app.js - ΕΝΗΜΕΡΩΜΕΝΟ ΜΕ SUPABASE
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { SUPABASE_CONFIG } from './src/config.js'

// Σύνδεση με Supabase
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key)

console.log("✅ Salon App loaded with Supabase!");

class SalonApp {
    constructor() {
        this.currentView = 'alphabet';
        this.currentLetter = '';
        this.currentClientId = null;
        this.init();
    }

    init() {
        console.log("🔄 Initializing Salon App with Supabase...");
        this.showAlphabetView();
        this.setupEventListeners();
    }

    // ΟΘΟΝΗ 1: Λίστα αλφαβήτου
    showAlphabetView() {
        const alphabet = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';

        const html = `
            <div class="max-w-4xl mx-auto">
                <h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">Επίλεξε Γράμμα Επωνύμου</h2>
                
                <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    ${alphabet.split('').map(letter => `
                        <button class="alphabet-btn bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-200 text-lg font-semibold text-gray-700" 
                                data-letter="${letter}">
                            ${letter}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
        this.currentView = 'alphabet';
    }

    // ΟΘΟΝΗ 2: Λίστα πελατών για συγκεκριμένο γράμμα (ΜΕ SUPABASE)
    async showClientsView(letter) {
        try {
            // Φόρτωση πελατών από Supabase
            const { data: clients, error } = await supabase
                .from('clients')
                .select('*')
                .ilike('last_name', `${letter}%`)
                .order('last_name');

            if (error) throw error;

            const html = `
                <div class="max-w-4xl mx-auto">
                    <button id="back-btn" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mb-6">
                        ← Πίσω στο Αλφάβητο
                    </button>

                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Πελάτες - Γράμμα ${letter}</h2>
                    <p class="text-gray-600 mb-6">${clients.length} πελάτης${clients.length !== 1 ? 'ες' : ''} βρέθηκαν</p>
                    
                    <button id="add-client-btn" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors mb-6">
                        ➕ Προσθήκη Νέας Πελάτισσας
                    </button>

                    <div class="space-y-3">
                        ${clients.length > 0 ?
                    clients.map(client => `
                                <div class="client-card bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-pink-300 transition-all duration-200 cursor-pointer" 
                                     data-client-id="${client.id}">
                                    <div class="font-semibold text-gray-800">${client.first_name} ${client.last_name}</div>
                                    <div class="text-gray-600 text-sm mt-1">📞 ${client.phone || 'Δεν υπάρχει τηλέφωνο'}</div>
                                </div>
                            `).join('')
                    :
                    '<div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center text-yellow-700">Δεν βρέθηκαν πελάτες για το γράμμα ' + letter + '</div>'
                }
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;
            this.currentView = 'clients';
            this.currentLetter = letter;

        } catch (error) {
            console.error('Σφάλμα φόρτωσης πελατών:', error);
            document.getElementById('app').innerHTML = `
                <div class="bg-red-50 border border-red-200 p-4 rounded-lg text-center text-red-700">
                    Σφάλμα φόρτωσης δεδομένων. Δοκιμάστε ξανά.
                </div>
            `;
        }
    }

    // ΟΘΟΝΗ 3: Στοιχεία πελάτη (ΜΕ SUPABASE)
    async showClientDetails(clientId) {
        try {
            // Φόρτωση στοιχείων πελάτη από Supabase
            const { data: client, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();

            if (error) throw error;

            const html = `
                <div class="max-w-2xl mx-auto">
                    <button id="back-btn" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mb-6">
                        ← Πίσω στη λίστα
                    </button>

                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">${client.first_name} ${client.last_name}</h2>
                        <p class="text-gray-600 mb-6">📞 ${client.phone || 'Δεν υπάρχει τηλέφωνο'}</p>
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">📝 Σημειώσεις & Βαφές:</label>
                            <textarea 
                                id="client-notes" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" 
                                rows="6"
                                placeholder="Σημειώστε τις βαφές, το χρώμα, τις τρίχες, ή οτιδήποτε άλλο σχετικό..."
                            >${client.notes || ''}</textarea>
                        </div>
                        
                        <button class="save-notes-btn bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium" data-client-id="${client.id}">
                            💾 Αποθήκευση Σημειώσεων
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;
            this.currentView = 'client-details';
            this.currentClientId = clientId;

        } catch (error) {
            console.error('Σφάλμα φόρτωσης πελάτη:', error);
        }
    }

    // ΟΘΟΝΗ 4: Προσθήκη νέου πελάτη (ΜΕ SUPABASE)
    showAddClientView() {
        const html = `
            <div class="max-w-md mx-auto">
                <button id="back-btn" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mb-6">
                    ← Πίσω στη λίστα
                </button>
                
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Προσθήκη Νέας Πελάτισσας</h2>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">👤 Όνομα *</label>
                            <input type="text" id="first-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                                   placeholder="Π.χ. Μαρία" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">📇 Επίθετο *</label>
                            <input type="text" id="last-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                                   placeholder="Π.χ. Παπαδοπούλου" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">📞 Τηλέφωνο</label>
                            <input type="tel" id="phone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                                   placeholder="Π.χ. 6912345678">
                        </div>
                        
                        <button id="save-client-btn" class="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors w-full font-medium">
                            ➕ Αποθήκευση Πελάτη
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
        this.currentView = 'add-client';
    }

    // ΑΠΟΘΗΚΕΥΣΗ ΣΗΜΕΙΩΣΕΩΝ (ΜΕ SUPABASE)
    async saveClientNotes() {
        const notes = document.getElementById('client-notes').value;
        const clientId = this.currentClientId;

        try {
            const { error } = await supabase
                .from('clients')
                .update({ notes: notes, updated_at: new Date() })
                .eq('id', clientId);

            if (error) throw error;

            alert('Οι σημειώσεις αποθηκεύτηκαν επιτυχώς!');

        } catch (error) {
            console.error('Σφάλμα αποθήκευσης σημειώσεων:', error);
            alert('Σφάλμα αποθήκευσης σημειώσεων. Δοκιμάστε ξανά.');
        }
    }

    // ΑΠΟΘΗΚΕΥΣΗ ΝΕΟΥ ΠΕΛΑΤΗ (ΜΕ SUPABASE)
    async saveNewClient() {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const phone = document.getElementById('phone').value;

        if (!firstName || !lastName) {
            alert('Παρακαλώ συμπληρώστε τουλάχιστον το όνομα και το επίθετο');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([
                    {
                        first_name: firstName,
                        last_name: lastName,
                        phone: phone || null,
                        notes: ''
                    }
                ])
                .select();

            if (error) throw error;

            alert(`Ο/Η ${firstName} ${lastName} προστέθηκε στους πελάτες!`);
            this.showAlphabetView();

        } catch (error) {
            console.error('Σφάλμα αποθήκευσης πελάτη:', error);
            alert('Σφάλμα αποθήκευσης πελάτη. Δοκιμάστε ξανά.');
        }
    }

    // EVENT HANDLERS
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // ΓΡΑΜΜΑΤΑ ΑΛΦΑΒΗΤΟΥ
            if (e.target.classList.contains('alphabet-btn')) {
                const letter = e.target.dataset.letter;
                this.showClientsView(letter);
            }

            // ΠΙΣΩ ΚΟΥΜΠΙ
            if (e.target.id === 'back-btn') {
                this.goBack();
            }

            // ΠΡΟΣΘΗΚΗ ΠΕΛΑΤΗ
            if (e.target.id === 'add-client-btn') {
                this.showAddClientView();
            }

            // ΚΛΙΚ ΣΕ ΠΕΛΑΤΗ (ΔΙΟΡΘΩΜΕΝΟ)
            if (e.target.closest('.client-card')) {
                const clientCard = e.target.closest('.client-card');
                const clientId = clientCard.dataset.clientId;
                this.showClientDetails(clientId);
            }

            // ΑΠΟΘΗΚΕΥΣΗ ΣΗΜΕΙΩΣΕΩΝ
            if (e.target.classList.contains('save-notes-btn')) {
                this.saveClientNotes();
            }

            // ΑΠΟΘΗΚΕΥΣΗ ΝΕΟΥ ΠΕΛΑΤΗ
            if (e.target.id === 'save-client-btn') {
                this.saveNewClient();
            }
        });
    }

    goBack() {
        if (this.currentView === 'clients' || this.currentView === 'add-client') {
            this.showAlphabetView();
        } else if (this.currentView === 'client-details') {
            this.showClientsView(this.currentLetter);
        }
    }
}

// ΕΚΚΙΝΗΣΗ ΕΦΑΡΜΟΓΗΣ
document.addEventListener('DOMContentLoaded', () => {
    new SalonApp();
});