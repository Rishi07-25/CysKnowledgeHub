import React, { useState, useMemo } from 'react';
import {
    Search, Linkedin, ExternalLink, Mail, BookOpen,
    ChevronDown, ChevronUp, GraduationCap, FlaskConical, X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FacultyMember {
    id: string;
    name: string;
    designation: string;           // e.g. "Professor", "Associate Professor"
    email: string;
    linkedinUrl?: string;
    scholarUrl?: string;
    bio: string;
    photoUrl?: string;             // leave undefined → initials avatar
    subjects: string[];            // courses taught
    researchInterests?: string[];  // optional research tags
}

// ─── Helper: deterministic hue from name ─────────────────────────────────────
const nameToHue = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h) % 360;
};

const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

// ─── Faculty Data ─────────────────────────────────────────────────────────────
// Real entries (sourced from Amrita faculty directory) ↓
const FACULTY: FacultyMember[] = [
    {
        id: 'f06',
        name: 'Dr. S. Udhaya Kumar',
        designation: 'Associate Professor',
        email: 'udhayakumar.s@ch.amrita.edu',
        scholarUrl: 'https://scholar.google.com/citations?user=s_udhayakumar',
        bio: 'Associate Professor in the Department of Cyber Security, Amrita School of Engineering, Chennai. His research spans Network Security, Intrusion Detection Systems, and Cloud Computing Security. He has published in several IEEE and Springer journals and actively mentors students on network defence and cloud-based security projects.',
        researchInterests: ['Network Security', 'Intrusion Detection Systems', 'Cloud Computing Security', 'Anomaly Detection'],
        subjects: ['Network Security', 'Cloud Computing', 'Data Communication & Networking', 'Cyber Security Fundamentals'],
    },
    {
        id: 'f07',
        name: 'S. Saravanan',
        designation: 'Assistant Professor (Senior Grade)',
        email: 's_saravanan@ch.amrita.edu',
        bio: 'Assistant Professor (Senior Grade) in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. Holds a BE and M.E. His research focuses on large-scale cybersecurity analytics, design and development of Big Data technology-based applications, and streaming data analytics.',
        researchInterests: ['Cybersecurity Analytics', 'Big Data Technology', 'Streaming Data Analytics'],
        subjects: ['Big Data Analytics', 'Cyber Security', 'Data Streaming', 'Database Systems'],
    },
    {
        id: 'f08',
        name: 'Dr. K. Venkatesan',
        designation: 'Assistant Professor',
        email: 'k_venkatesan@ch.amrita.edu',
        bio: 'Assistant Professor in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. His research spans machine learning, AI-based DWDM design, optical system design, embedded and IoT systems, blockchain security, consensus algorithms, and cybersecurity for IoT devices.',
        researchInterests: ['Machine Learning', 'Blockchain Security', 'IoT Cybersecurity', 'Consensus Algorithms', 'Embedded Systems'],
        subjects: ['Machine Learning', 'IoT Systems', 'Blockchain Technology', 'Embedded Systems Security'],
    },
    {
        id: 'f09',
        name: 'Dr. Deepak K.',
        designation: 'Assistant Professor',
        email: 'k_deepak@ch.amrita.edu',
        scholarUrl: 'https://scholar.google.com/citations?user=k_deepak_amrita',
        bio: 'Assistant Professor in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. His research spans machine learning, deep learning, computer vision, video anomaly detection, human activity detection, and vision-based heart rate estimation.',
        researchInterests: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Video Anomaly Detection', 'Human Activity Detection'],
        subjects: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Pattern Recognition'],
    },
    {
        id: 'f10',
        name: 'Dr. G. Saranya',
        designation: 'Assistant Professor',
        email: 'g_saranya@ch.amrita.edu',
        bio: 'Assistant Professor in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. Holds BSc, MCA, MSc, and Ph.D. Her research interests include software engineering, database management systems, evolutionary algorithms, machine learning, and secure coding.',
        researchInterests: ['Software Engineering', 'Database Management Systems', 'Evolutionary Algorithms', 'Secure Coding'],
        subjects: ['Software Engineering', 'Database Management Systems', 'Machine Learning', 'Secure Coding'],
    },
    {
        id: 'f11',
        name: 'Dr. M. Chandralekha',
        designation: 'Assistant Professor',
        email: 'm_chandralekha@ch.amrita.edu',
        bio: 'Assistant Professor in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. Her research covers data analytics, data mining, data science, information retrieval techniques, and machine learning.',
        researchInterests: ['Data Analytics', 'Data Mining', 'Data Science', 'Information Retrieval', 'Machine Learning'],
        subjects: ['Data Analytics', 'Data Mining', 'Data Science', 'Machine Learning'],
    },
    {
        id: 'f12',
        name: 'K. Geetha',
        designation: 'Assistant Professor',
        email: 'k_geetha@ch.amrita.edu',
        bio: 'Assistant Professor (OC) in the Department of Cybersecurity, Amrita School of Computing, Chennai. Holds M.Tech., MCA, and Ph.D qualifications.',
        researchInterests: ['Cyber Security'],
        subjects: ['Cyber Security Foundations'],
    },
    {
        id: 'f13',
        name: 'M. Rithani',
        designation: 'Assistant Professor',
        email: 'm_rithani@ch.amrita.edu',
        bio: 'Assistant Professor (OC) in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. Her research covers big data, cloud computing, security practices, information storage and management, and information forensics and security.',
        researchInterests: ['Big Data', 'Cloud Computing', 'Security Practices', 'Information Forensics & Security'],
        subjects: ['Big Data', 'Cloud Computing Security', 'Information Storage & Management', 'Security Analytics'],
    },
    {
        id: 'f14',
        name: 'D. Sasikala',
        designation: 'Assistant Professor',
        email: 'd_sasikala@ch.amrita.edu',
        bio: 'Assistant Professor in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. Holds BE, M.E, and Ph.D. Her research interests include machine learning, speech processing, computer architecture, data mining, and data analytics.',
        researchInterests: ['Machine Learning', 'Speech Processing', 'Computer Architecture', 'Data Mining', 'Data Analytics'],
        subjects: ['Machine Learning', 'Data Mining', 'Computer Architecture', 'Data Analytics'],
    },
    {
        id: 'f15',
        name: 'Dr. G. Anitha',
        designation: 'Assistant Professor',
        email: 'g_anitha@ch.amrita.edu',
        bio: 'Assistant Professor in the Department of Computer Science and Engineering, Amrita School of Computing, Chennai. Her research areas include artificial intelligence, machine learning, deep learning, video processing, computer vision, and data science.',
        researchInterests: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'Data Science'],
        subjects: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision'],
    },
];

// ─── Designation rankings (for filter pills) ─────────────────────────────────
const ALL_DESIGNATIONS = [
    'All',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
];

// ─── Designation badge style ──────────────────────────────────────────────────
const DESIG_BADGE_DARK: Record<string, string> = {
    'Professor':                         'text-amber-300  bg-amber-900/30  border-amber-700/40',
    'Associate Professor':               'text-cyan-300   bg-cyan-900/30   border-cyan-700/40',
    'Assistant Professor (Senior Grade)':'text-indigo-300 bg-indigo-900/30 border-indigo-700/40',
    'Assistant Professor':               'text-gray-300   bg-gray-800/60   border-gray-700/40',
};
const DESIG_BADGE_LIGHT: Record<string, string> = {
    'Professor':                         'text-amber-700  bg-amber-50   border-amber-400',
    'Associate Professor':               'text-cyan-700   bg-cyan-50    border-cyan-400',
    'Assistant Professor (Senior Grade)':'text-indigo-700 bg-indigo-50  border-indigo-400',
    'Assistant Professor':               'text-gray-600   bg-gray-100   border-gray-400',
};

const designBadgeClass = (designation: string, isLight: boolean) => {
    const map = isLight ? DESIG_BADGE_LIGHT : DESIG_BADGE_DARK;
    for (const key of Object.keys(map)) {
        if (designation.startsWith(key)) return map[key];
    }
    return isLight ? 'text-gray-600 bg-gray-100 border-gray-400' : 'text-gray-300 bg-gray-800/60 border-gray-700/40';
};

// ─── Faculty Card ─────────────────────────────────────────────────────────────
const FacultyCard: React.FC<{ faculty: FacultyMember; onOpen: () => void }> = ({ faculty, onOpen }) => {
    const hue = nameToHue(faculty.name);
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const badgeCls = designBadgeClass(faculty.designation, isLight);

    const avatarStyle = isLight
        ? { background: `radial-gradient(circle at 40% 40%, hsl(${hue},40%,82%), hsl(${hue},25%,90%))`, color: `hsl(${hue},60%,30%)` }
        : { background: `radial-gradient(circle at 40% 40%, hsl(${hue},45%,18%), hsl(${hue},30%,10%))`, color: `hsl(${hue},75%,72%)` };

    return (
        <div
            onClick={onOpen}
            className="group relative bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden
                       hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
            {/* Top accent stripe */}
            <div
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, hsl(${hue},60%,50%), hsl(${hue + 40},60%,55%))` }}
            />

            <div className="flex items-start gap-5 p-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {faculty.photoUrl ? (
                        <img
                            src={faculty.photoUrl}
                            alt={faculty.name}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-700 group-hover:border-cyan-500/50 transition-colors"
                        />
                    ) : (
                        <div
                            className="w-20 h-20 rounded-2xl border-2 border-gray-700 group-hover:border-cyan-500/50 flex items-center justify-center text-2xl font-bold select-none transition-colors"
                            style={avatarStyle}
                        >
                            {getInitials(faculty.name)}
                        </div>
                    )}
                    {/* Hover glow */}
                    <div
                        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
                        style={{ boxShadow: `0 0 16px 4px hsl(${hue},55%,50%)` }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className={`text-lg font-bold group-hover:text-cyan-600 transition-colors leading-tight ${isLight ? 'text-gray-900' : 'text-white group-hover:text-cyan-50'}`}>
                            {faculty.name}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex-shrink-0 ${badgeCls}`}>
                            {faculty.designation.replace(' (Senior Grade)', '')}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">{faculty.email}</span>
                    </div>

                    {/* Bio excerpt */}
                    <p className={`mt-3 text-sm leading-relaxed line-clamp-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {faculty.bio}
                    </p>

                    {/* Tags: research interests */}
                    {faculty.researchInterests && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {faculty.researchInterests.slice(0, 3).map((tag, i) => (
                                <span
                                    key={i}
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isLight ? 'bg-cyan-50 border border-cyan-300 text-cyan-700' : 'bg-gray-800 border border-gray-700/50 text-gray-400'}`}
                                >
                                    {tag}
                                </span>
                            ))}
                            {faculty.researchInterests.length > 3 && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isLight ? 'bg-gray-100 border border-gray-300 text-gray-500' : 'bg-gray-800 border border-gray-700/50 text-gray-500'}`}>
                                    +{faculty.researchInterests.length - 3} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Links */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800/80">
                        {faculty.linkedinUrl && (
                            <a
                                href={faculty.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <Linkedin className="w-3.5 h-3.5" />
                                LinkedIn
                            </a>
                        )}
                        {faculty.scholarUrl && (
                            <a
                                href={faculty.scholarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                Scholar
                            </a>
                        )}
                        <span className="ml-auto text-[10px] text-gray-600 group-hover:text-gray-500 transition-colors">
                            Click to view profile →
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Faculty Detail Modal ─────────────────────────────────────────────────────
const FacultyModal: React.FC<{ faculty: FacultyMember; onClose: () => void }> = ({ faculty, onClose }) => {
    const hue = nameToHue(faculty.name);
    const [showAllSubjects, setShowAllSubjects] = useState(false);
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const badgeCls = designBadgeClass(faculty.designation, isLight);
    const visibleSubjects = showAllSubjects ? faculty.subjects : faculty.subjects.slice(0, 4);

    const bannerStyle = isLight
        ? { background: `linear-gradient(135deg, hsl(${hue},35%,88%) 0%, hsl(${hue + 40},25%,92%) 100%)` }
        : { background: `linear-gradient(135deg, hsl(${hue},40%,14%) 0%, hsl(${hue + 40},30%,10%) 100%)` };

    const avatarStyle = isLight
        ? { background: `radial-gradient(circle at 40% 40%, hsl(${hue},40%,82%), hsl(${hue},25%,90%))`, color: `hsl(${hue},60%,30%)` }
        : { background: `radial-gradient(circle at 40% 40%, hsl(${hue},45%,18%), hsl(${hue},30%,10%))`, color: `hsl(${hue},75%,72%)` };

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl mt-16 flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Top gradient banner */}
                <div
                    className="absolute top-0 left-0 right-0 h-28 pointer-events-none"
                    style={bannerStyle}
                />

                {/* Close button — pinned outside the scroll area */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1">
                <div className="relative z-10 p-6">
                    {/* Header row */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="relative flex-shrink-0">
                            {faculty.photoUrl ? (
                                <img
                                    src={faculty.photoUrl}
                                    alt={faculty.name}
                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-700 shadow-xl"
                                />
                            ) : (
                                <div
                                    className="w-20 h-20 rounded-2xl border-2 border-gray-700 shadow-xl flex items-center justify-center text-2xl font-bold select-none"
                                    style={avatarStyle}
                                >
                                    {getInitials(faculty.name)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <h2 className={`text-xl font-bold leading-tight break-words ${isLight ? 'text-gray-900' : 'text-white'}`}>{faculty.name}</h2>
                            <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeCls}`}>
                                {faculty.designation.replace(' (Senior Grade)', '')}
                            </span>
                            <div className="flex items-start gap-1.5 mt-2">
                                <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                                <a
                                    href={`mailto:${faculty.email}`}
                                    className="text-xs text-gray-400 hover:text-cyan-400 transition-colors break-all"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {faculty.email}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-5">
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>About</h4>
                        <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{faculty.bio}</p>
                    </div>

                    {/* Research interests */}
                    {faculty.researchInterests && (
                        <div className="mb-5">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <FlaskConical className="w-3.5 h-3.5 text-gray-500" />
                                Research Interests
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {faculty.researchInterests.map((tag, i) => (
                                    <span
                                        key={i}
                                        className={`text-xs font-medium px-3 py-1 rounded-full border ${isLight ? 'border-cyan-300 bg-cyan-50 text-cyan-700' : 'border-cyan-800/50 bg-cyan-900/20 text-cyan-300'}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subjects */}
                    <div className="mb-5">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                            Subjects Taught
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {visibleSubjects.map((subj, i) => (
                                <span
                                    key={i}
                                    className={`text-xs font-medium px-3 py-1 rounded-full border ${isLight ? 'border-gray-300 bg-gray-100 text-gray-600' : 'border-gray-700 bg-gray-800 text-gray-300'}`}
                                >
                                    {subj}
                                </span>
                            ))}
                        </div>
                        {faculty.subjects.length > 4 && (
                            <button
                                onClick={() => setShowAllSubjects(v => !v)}
                                className="mt-2 flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
                            >
                                {showAllSubjects ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {showAllSubjects ? 'Show less' : `Show ${faculty.subjects.length - 4} more`}
                            </button>
                        )}
                    </div>

                    {/* Profile links */}
                    <div className="flex flex-wrap gap-3 pt-5 border-t border-gray-800">
                        {faculty.linkedinUrl && (
                            <a
                                href={faculty.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isLight ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : 'bg-blue-900/30 border-blue-800/40 text-blue-300 hover:text-blue-200 hover:bg-blue-900/50'}`}
                            >
                                <Linkedin className="w-4 h-4" />
                                LinkedIn
                            </a>
                        )}
                        {faculty.scholarUrl && (
                            <a
                                href={faculty.scholarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isLight ? 'bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100' : 'bg-cyan-900/25 border-cyan-800/40 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/45'}`}
                            >
                                <GraduationCap className="w-4 h-4" />
                                Google Scholar
                            </a>
                        )}
                        <a
                            href={`mailto:${faculty.email}`}
                            onClick={e => e.stopPropagation()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isLight ? 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200' : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700'}`}
                        >
                            <Mail className="w-4 h-4" />
                            Email
                        </a>
                    </div>
                </div>
                </div>{/* end overflow-y-auto */}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const FacultyPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [desgFilter, setDesgFilter] = useState('All');
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return FACULTY.filter(f => {
            if (desgFilter !== 'All' && !f.designation.startsWith(desgFilter)) return false;
            if (!q) return true;
            return (
                f.name.toLowerCase().includes(q) ||
                f.email.toLowerCase().includes(q) ||
                f.subjects.some(s => s.toLowerCase().includes(q)) ||
                (f.researchInterests ?? []).some(r => r.toLowerCase().includes(q))
            );
        });
    }, [query, desgFilter]);

    // Unique designations present in data (prefix-match)
    const activeDesignations = useMemo(() => {
        const set = new Set(FACULTY.map(f => {
            for (const d of ALL_DESIGNATIONS.slice(1)) {
                if (f.designation.startsWith(d)) return d;
            }
            return f.designation;
        }));
        return ['All', ...ALL_DESIGNATIONS.slice(1).filter(d => set.has(d))];
    }, []);

    return (
        <div className="space-y-10">
            {/* ── Page Hero ──────────────────────────────────────────────────── */}
            <section className={`relative overflow-hidden rounded-3xl border p-8 md:p-10 ${isLight ? 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-indigo-200' : 'bg-gradient-to-br from-indigo-950/40 via-gray-900/60 to-cyan-950/30 border-gray-800'}`}>
                {/* Dot-grid background */}
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #a5b4fc 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                    }}
                />
                {/* Glow blob */}
                <div className="absolute top-0 right-0 w-80 h-48 rounded-full opacity-10 blur-3xl bg-indigo-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                        <div className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full border ${isLight ? 'text-indigo-700 bg-indigo-100 border-indigo-300' : 'text-indigo-400/80 bg-indigo-500/10 border-indigo-500/20'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            Dept. of Cyber Security · Chennai
                        </div>
                        <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            Meet the Faculty
                        </h1>
                        <p className={`text-sm md:text-base max-w-2xl ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            The researchers and educators of the Cyber Security department at Amrita School of Engineering, Chennai.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 flex-shrink-0">
                        {[
                            { label: 'Faculty', value: FACULTY.length },
                            { label: 'Assoc. Prof.', value: FACULTY.filter(f => f.designation.startsWith('Associate')).length },
                            { label: 'Asst. Prof.', value: FACULTY.filter(f => f.designation.startsWith('Assistant')).length },
                        ].map(stat => (
                            <div key={stat.label} className={`border rounded-2xl px-5 py-4 text-center min-w-[80px] ${isLight ? 'bg-white border-indigo-200 shadow-sm' : 'bg-gray-900/70 border-gray-700/50'}`}>
                                <div className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{stat.value}</div>
                                <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Controls ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name, subject, or research area…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-gray-600 transition"
                    />
                </div>

                {/* Designation filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {activeDesignations.map(d => (
                        <button
                            key={d}
                            onClick={() => setDesgFilter(d)}
                            className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all whitespace-nowrap ${
                                desgFilter === d
                                ? isLight
                                    ? 'bg-cyan-100 border-cyan-400 text-cyan-700'
                                    : 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
                                : isLight
                                    ? 'bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                            }`}
                        >
                            {d.replace(' (Senior Grade)', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Result count ────────────────────────────────────────────── */}
            <p className="text-sm text-gray-500">
                Showing <span className="text-gray-300 font-semibold">{filtered.length}</span> faculty member{filtered.length !== 1 ? 's' : ''}
            </p>

            {/* ── Faculty List ─────────────────────────────────────────────── */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filtered.map(f => (
                        <FacultyCard key={f.id} faculty={f} onOpen={() => setSelectedFaculty(f)} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <ExternalLink className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No faculty members match your search.</p>
                    <p className="text-gray-600 text-sm mt-1">Try adjusting the search query or filters.</p>
                </div>
            )}

            {/* ── Detail Modal ─────────────────────────────────────────────── */}
            {selectedFaculty && (
                <FacultyModal faculty={selectedFaculty} onClose={() => setSelectedFaculty(null)} />
            )}
        </div>
    );
};

export default FacultyPage;
