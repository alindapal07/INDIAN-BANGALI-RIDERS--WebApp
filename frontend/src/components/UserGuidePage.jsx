import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, BookOpen, Bike, Users, BarChart2, MessageSquare, Bell, Map, Shield, Heart } from 'lucide-react';

const GUIDE = {
  en: {
    title: 'User Guide',
    subtitle: 'Complete guide to using the Indian Bangali Riders platform',
    search: 'Search guide...',
    sections: [
      {
        icon: Users,
        title: 'Getting Started & Registration',
        color: 'text-rose-400',
        bg: 'bg-rose-600/10 border-rose-600/20',
        steps: [
          { q: 'How do I join IBR?', a: 'Click "Join the Pack" or "Sign Up" on the homepage. Fill in your username, email and password. After registration, your account will be in "pending" state awaiting admin approval.' },
          { q: 'Why is my account pending?', a: 'IBR is an exclusive motorcycle club. Every new member requires one-time admin approval to verify your riding background. This usually takes 24-48 hours.' },
          { q: 'What happens after approval?', a: 'Once approved, you get full access: book rides, post in the feed, chat with members, and access your dashboard. All future logins are instant — no re-approval needed.' },
          { q: 'How do I log in?', a: 'Click "Sign In" on the homepage or in the navigation bar. Enter your email and password. If approved, you go directly to your dashboard.' },
          { q: 'How do I log in as Admin?', a: 'Click "Admin Login" button. Admin accounts require special credentials and 2FA verification for security.' },
        ]
      },
      {
        icon: BarChart2,
        title: 'Dashboard',
        color: 'text-blue-400',
        bg: 'bg-blue-600/10 border-blue-600/20',
        steps: [
          { q: 'What is the User Dashboard?', a: 'Your personal control panel. Shows your profile, booking history, journey stats, liked posts, and account settings. Navigate using the tabs at the top.' },
          { q: 'How do I update my profile?', a: 'Go to Dashboard → Profile tab. You can update your username, bio, and upload a profile photo.' },
          { q: 'What is the Admin Dashboard?', a: 'Admins see a full analytics panel showing member stats, booking data, revenue charts, and CMS controls for all site content.' },
          { q: 'How do I navigate the dashboard on mobile?', a: 'Use the tab bar at the top of the dashboard to switch between sections. Use the bottom navigation bar to go back to the landing page.' },
        ]
      },
      {
        icon: Bike,
        title: 'Journeys & Bookings',
        color: 'text-amber-400',
        bg: 'bg-amber-600/10 border-amber-600/20',
        steps: [
          { q: 'How do I book a ride?', a: 'Go to "Expeditions" section on the homepage. Click on any upcoming journey to see details. Click "Book This Ride" and fill the booking form. You must be logged in and approved.' },
          { q: 'Where can I see my bookings?', a: 'Dashboard → My Journeys tab shows all your bookings with status, journey dates, and payment info.' },
          { q: 'How does admin see bookings?', a: 'Admin Dashboard → Bookings tab shows all bookings with full rider details (name, email, phone, bike model) and journey information (title, date, route, price).' },
          { q: 'Can I cancel a booking?', a: 'Contact the admin via WhatsApp (+91 9433545958) or the Contact page to request cancellation.' },
        ]
      },
      {
        icon: Heart,
        title: 'Community Feed & Posts',
        color: 'text-pink-400',
        bg: 'bg-pink-600/10 border-pink-600/20',
        steps: [
          { q: 'What is the Community Feed?', a: 'A Facebook-style timeline where approved members can share ride updates, photos, announcements, and polls. Find it via the "Feed" icon in the bottom navigation.' },
          { q: 'How do I react to a post?', a: 'On desktop: hover over the ❤️ button to see emoji reaction options (❤️🔥🏍️😮👏). On mobile: tap the ❤️ button to see the reactions panel.' },
          { q: 'How do I comment?', a: 'Click the 💬 icon on any post. Type in the comment box at the bottom of the thread and press Enter or the send button.' },
          { q: 'Can I reply to comments?', a: 'Yes! Click "Reply" under any comment to start a threaded reply. These appear indented under the parent comment.' },
          { q: 'What types of posts can I create?', a: 'Write (text), Photo (image), Video, Announcement (with themed backgrounds), Ride Update (with themed backgrounds), and Poll. Admins can also pin posts.' },
          { q: 'What are polls?', a: 'Create polls by selecting "Poll" post type. Add your question and up to 6 options. Approved members can vote and see live percentage results.' },
        ]
      },
      {
        icon: MessageSquare,
        title: 'Chat & Group Chat',
        color: 'text-purple-400',
        bg: 'bg-purple-600/10 border-purple-600/20',
        steps: [
          { q: 'How do I message the admin?', a: 'Click the chat bubble (💬) floating button on your dashboard. Select "Admin" from the list to start a direct message.' },
          { q: 'What is Group Chat?', a: 'Admins can create group chats with selected members — similar to WhatsApp groups. Members added to a group can see and participate in group conversations.' },
          { q: 'How do I join a group?', a: 'Admins add you to groups. You\'ll receive a notification and the group will appear in your Chat section automatically.' },
          { q: 'Are chats real-time?', a: 'Yes! All messages use WebSocket (Socket.io) for instant delivery. Typing indicators show when someone is typing.' },
        ]
      },
      {
        icon: Bell,
        title: 'Notifications',
        color: 'text-cyan-400',
        bg: 'bg-cyan-600/10 border-cyan-600/20',
        steps: [
          { q: 'How do notifications work?', a: 'Click the 🔔 bell icon in the navbar. You receive notifications for: likes on your posts, comments, direct messages, group messages, admin announcements, and approval status changes.' },
          { q: 'How do I mark notifications as read?', a: 'Click "Mark all read" inside the notification dropdown, or view individual notifications.' },
          { q: 'Are notifications real-time?', a: 'Yes! The bell badge updates instantly using WebSocket technology. No need to refresh the page.' },
        ]
      },
      {
        icon: Map,
        title: 'Gallery & Stories',
        color: 'text-green-400',
        bg: 'bg-green-600/10 border-green-600/20',
        steps: [
          { q: 'What is The Vault?', a: 'The Gallery section shows all photos, videos, and reels uploaded by admins — displayed in an Instagram-like grid. Click any post to see details and interact.' },
          { q: 'What are Stories?', a: 'Short-lived visual content (24h) uploaded by admin. Tap any story thumbnail to view. Swipe left/right to navigate between stories.' },
          { q: 'How do I like a gallery post?', a: 'You must be logged in and approved. Click the ❤️ button on any post in the gallery to like/unlike it.' },
        ]
      },
      {
        icon: Shield,
        title: 'Admin Controls',
        color: 'text-orange-400',
        bg: 'bg-orange-600/10 border-orange-600/20',
        steps: [
          { q: 'What can the admin control?', a: 'Everything on the platform: approve/reject members, manage journeys/bookings, upload posts/stories/highlights, control hero section, create group chats, view analytics, and toggle section visibility.' },
          { q: 'How does admin approve members?', a: 'Admin Dashboard → Members tab → Pending sub-tab. Click Approve (✓) or Reject (✗) on each pending user.' },
          { q: 'How does admin control the landing page?', a: 'Admin Dashboard → UI Settings tab lets you toggle which sections show on the landing page. Changes are instant for all visitors.' },
          { q: 'Can admin pin posts?', a: 'Yes! Click ⋯ on any timeline post → Pin. Pinned posts always appear at the top of the feed.' },
        ]
      },
    ]
  },
  bn: {
    title: 'ব্যবহারকারী গাইড',
    subtitle: 'ইন্ডিয়ান বাঙালি রাইডার্স প্ল্যাটফর্ম ব্যবহারের সম্পূর্ণ গাইড',
    search: 'গাইড খুঁজুন...',
    sections: [
      {
        icon: Users,
        title: 'শুরু করা ও নিবন্ধন',
        color: 'text-rose-400',
        bg: 'bg-rose-600/10 border-rose-600/20',
        steps: [
          { q: 'IBR-তে কীভাবে যোগ দেব?', a: 'হোমপেজে "Join the Pack" বা "Sign Up" বাটনে ক্লিক করুন। আপনার নাম, ইমেইল ও পাসওয়ার্ড দিন। নিবন্ধনের পরে অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।' },
          { q: 'কেন আমার অ্যাকাউন্ট "pending" আছে?', a: 'IBR একটি বিশেষ মোটরসাইকেল ক্লাব। প্রথমবার যোগ দেওয়ার সময় অ্যাডমিনের অনুমোদন লাগে। সাধারণত ২৪-৪৮ ঘণ্টা সময় লাগে।' },
          { q: 'অনুমোদনের পরে কী হবে?', a: 'অনুমোদিত হলে আপনি সম্পূর্ণ অ্যাক্সেস পাবেন: রাইড বুক করা, ফিডে পোস্ট করা, চ্যাট করা এবং ড্যাশবোর্ড ব্যবহার। পরবর্তী লগইন তাৎক্ষণিক।' },
          { q: 'লগইন কীভাবে করব?', a: 'হোমপেজে বা নেভিগেশনে "Sign In" ক্লিক করুন। ইমেইল ও পাসওয়ার্ড দিন।' },
          { q: 'অ্যাডমিন হিসেবে লগইন কীভাবে?', a: '"Admin Login" বাটনে ক্লিক করুন। বিশেষ ক্রেডেনশিয়াল ও ২এফএ প্রয়োজন।' },
        ]
      },
      {
        icon: Heart,
        title: 'কমিউনিটি ফিড ও পোস্ট',
        color: 'text-pink-400',
        bg: 'bg-pink-600/10 border-pink-600/20',
        steps: [
          { q: 'কমিউনিটি ফিড কী?', a: 'ফেসবুকের মতো একটি টাইমলাইন যেখানে অনুমোদিত সদস্যরা রাইড আপডেট, ফটো, ঘোষণা ও পোল শেয়ার করতে পারেন।' },
          { q: 'পোস্টে রিঅ্যাক্ট কীভাবে করব?', a: 'মোবাইলে: ❤️ বাটনে ট্যাপ করুন রিঅ্যাকশন প্যানেল দেখতে (❤️🔥🏍️😮👏)। ডেস্কটপে: হোভার করুন।' },
          { q: 'পোল কী?', a: '"Poll" টাইপ পোস্ট বেছে নিন, প্রশ্ন ও অপশন যোগ করুন। সদস্যরা ভোট দিতে পারবেন ও লাইভ শতাংশ দেখতে পারবেন।' },
        ]
      },
      {
        icon: Bike,
        title: 'জার্নি ও বুকিং',
        color: 'text-amber-400',
        bg: 'bg-amber-600/10 border-amber-600/20',
        steps: [
          { q: 'রাইড কীভাবে বুক করব?', a: '"Expeditions" সেকশনে যান। যে জার্নি বুক করতে চান তাতে ক্লিক করুন। "Book This Ride" বাটন চাপুন এবং ফর্ম পূরণ করুন। লগইন ও অনুমোদিত থাকতে হবে।' },
          { q: 'আমার বুকিং কোথায় দেখব?', a: 'ড্যাশবোর্ড → My Journeys ট্যাবে সব বুকিং দেখা যাবে।' },
        ]
      },
      {
        icon: MessageSquare,
        title: 'চ্যাট ও গ্রুপ চ্যাট',
        color: 'text-purple-400',
        bg: 'bg-purple-600/10 border-purple-600/20',
        steps: [
          { q: 'অ্যাডমিনকে মেসেজ কীভাবে করব?', a: 'ড্যাশবোর্ডে ভাসমান চ্যাট বাবল (💬) ক্লিক করুন। "Admin" নির্বাচন করুন।' },
          { q: 'গ্রুপ চ্যাট কী?', a: 'অ্যাডমিন সদস্যদের নিয়ে হোয়াটসঅ্যাপের মতো গ্রুপ তৈরি করতে পারেন। যোগ করা হলে নোটিফিকেশন পাবেন।' },
        ]
      },
    ]
  },
  hi: {
    title: 'उपयोगकर्ता गाइड',
    subtitle: 'इंडियन बाঙালी राइडर्स प्लेटफ़ॉर्म का पूरा उपयोग गाइड',
    search: 'गाइड खोजें...',
    sections: [
      {
        icon: Users,
        title: 'शुरुआत और पंजीकरण',
        color: 'text-rose-400',
        bg: 'bg-rose-600/10 border-rose-600/20',
        steps: [
          { q: 'IBR में कैसे शामिल हों?', a: 'होमपेज पर "Join the Pack" या "Sign Up" बटन क्लिक करें। अपना नाम, ईमेल और पासवर्ड भरें। पंजीकरण के बाद एडमिन की मंज़ूरी का इंतज़ार करें।' },
          { q: 'मेरा अकाउंट "pending" क्यों है?', a: 'IBR एक विशेष मोटरसाइकिल क्लब है। पहली बार जुड़ने पर एडमिन की मंज़ूरी ज़रूरी है। आमतौर पर 24-48 घंटे लगते हैं।' },
          { q: 'मंज़ूरी के बाद क्या होगा?', a: 'मंज़ूरी मिलने पर आपको पूरी पहुंच मिलेगी: राइड बुक करना, फ़ीड में पोस्ट करना, चैट करना और डैशबोर्ड इस्तेमाल करना। आगे के सभी लॉगिन तुरंत होंगे।' },
          { q: 'लॉगिन कैसे करें?', a: 'होमपेज या नेविगेशन बार में "Sign In" क्लिक करें। ईमेल और पासवर्ड डालें।' },
          { q: 'एडमिन लॉगिन कैसे करें?', a: '"Admin Login" बटन क्लिक करें। विशेष क्रेडेंशियल और 2FA ज़रूरी है।' },
        ]
      },
      {
        icon: Heart,
        title: 'कम्युनिटी फ़ीड और पोस्ट',
        color: 'text-pink-400',
        bg: 'bg-pink-600/10 border-pink-600/20',
        steps: [
          { q: 'कम्युनिटी फ़ीड क्या है?', a: 'फेसबुक जैसी टाइमलाइन जहाँ मंज़ूरशुदा सदस्य राइड अपडेट, फ़ोटो, घोषणाएं और पोल शेयर कर सकते हैं।' },
          { q: 'पोस्ट पर रिएक्ट कैसे करें?', a: 'मोबाइल पर: ❤️ बटन टैप करें रिएक्शन पैनल देखने के लिए। डेस्कटॉप पर: ❤️ पर होवर करें।' },
          { q: 'पोल क्या है?', a: '"Poll" टाइप चुनें, सवाल और विकल्प जोड़ें। सदस्य वोट करके लाइव प्रतिशत देख सकते हैं।' },
        ]
      },
      {
        icon: Bike,
        title: 'जर्नी और बुकिंग',
        color: 'text-amber-400',
        bg: 'bg-amber-600/10 border-amber-600/20',
        steps: [
          { q: 'राइड कैसे बुक करें?', a: '"Expeditions" सेक्शन में जाएं। किसी भी जर्नी पर क्लिक करें। "Book This Ride" बटन दबाएं और फ़ॉर्म भरें। लॉगिन और मंज़ूरी ज़रूरी है।' },
          { q: 'अपनी बुकिंग कहाँ देखें?', a: 'डैशबोर्ड → My Journeys टैब में सभी बुकिंग दिखेंगी।' },
        ]
      },
      {
        icon: MessageSquare,
        title: 'चैट और ग्रुप चैट',
        color: 'text-purple-400',
        bg: 'bg-purple-600/10 border-purple-600/20',
        steps: [
          { q: 'एडमिन को मेसेज कैसे करें?', a: 'डैशबोर्ड में फ्लोटिंग चैट बटन (💬) क्लिक करें। "Admin" चुनें।' },
          { q: 'ग्रुप चैट क्या है?', a: 'एडमिन व्हाट्सएप की तरह ग्रुप बना सकते हैं। जोड़े जाने पर नोटिफिकेशन मिलेगी।' },
        ]
      },
    ]
  }
};

const UserGuidePage = () => {
  const [lang, setLang] = useState('en');
  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState(null);
  const [openQ, setOpenQ] = useState(null);

  const guide = GUIDE[lang];

  const filtered = guide.sections.map(s => ({
    ...s,
    steps: s.steps.filter(st =>
      !search || st.q.toLowerCase().includes(search.toLowerCase()) || st.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(s => s.steps.length > 0);

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-24 md:pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-600/10 border border-rose-600/20 rounded-full px-4 py-1.5 mb-6">
            <BookOpen className="w-3 h-3 text-rose-400" />
            <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.4em]">Help Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4">{guide.title}</h1>
          <p className="text-neutral-500 text-sm">{guide.subtitle}</p>
        </div>

        {/* Language switcher */}
        <div className="flex justify-center gap-3 mb-8">
          {[{ code: 'en', label: 'English' }, { code: 'bn', label: 'বাংলা' }, { code: 'hi', label: 'हिंदी' }].map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpenSection(null); setOpenQ(null); }}
              className={`px-4 py-2 rounded-full text-xs font-black upper tracking-widest transition ${lang === l.code ? 'bg-rose-600 text-white' : 'glass border border-white/8 text-neutral-400 hover:text-white'}`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={guide.search}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-700 outline-none focus:border-rose-500 transition" />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {filtered.map((section, si) => (
            <div key={si} className={`glass border rounded-2xl overflow-hidden ${section.bg}`}>
              {/* Section header */}
              <button onClick={() => setOpenSection(openSection === si ? null : si)}
                className="w-full flex items-center gap-4 p-5 text-left focus:outline-none">
                <div className={`w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0 ${section.color}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-black text-sm ${section.color}`}>{section.title}</p>
                  <p className="text-neutral-600 text-[10px]">{section.steps.length} topics</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-600 transition-transform ${openSection === si ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openSection === si && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-2 border-t border-white/5 pt-4">
                      {section.steps.map((step, qi) => (
                        <div key={qi} className="bg-black/20 rounded-xl overflow-hidden">
                          <button onClick={() => setOpenQ(openQ === `${si}-${qi}` ? null : `${si}-${qi}`)}
                            className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer">
                            <p className="text-white text-sm font-bold leading-snug">{step.q}</p>
                            <ChevronDown className={`w-4 h-4 text-neutral-600 flex-shrink-0 transition-transform ${openQ === `${si}-${qi}` ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {openQ === `${si}-${qi}` && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <p className="px-4 pb-4 text-neutral-400 text-sm leading-relaxed border-t border-white/5 pt-3">{step.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer help */}
        <div className="mt-12 glass border border-white/8 rounded-2xl p-6 text-center">
          <p className="text-neutral-500 text-sm mb-3">Still need help?</p>
          <a href="https://wa.me/919433545958?text=Hi IBR! I need help with the app."
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition">
            💬 WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserGuidePage;
