import React, { useState, useMemo } from 'react';
import { Search, Github, Linkedin, ExternalLink, Globe, Twitter, User, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface StudentLink {
    type: 'linkedin' | 'github' | 'portfolio' | 'twitter' | 'other';
    url: string;
    label?: string;
}

export interface Student {
    id: string;
    name: string;
    rollNumber: string;
    batch: string;   // e.g. "2023"
    section: string; // e.g. "A"
    photo?: string;
    links: StudentLink[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Replace or extend this with your real data source.
const STUDENTS: Student[] = [
    // ── 2022 Batch ────────────────────────────────────────────────────────────
    // Section A
    { id: 's01', name: 'Addala Ratna Bhavya Phani Soumika', rollNumber: '22CS001', batch: '2022', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's02', name: 'Priya Suresh ', rollNumber: '22CS002', batch: '2022', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }, { type: 'portfolio', url: '#' }] },
    { id: 's03', name: 'Rohan Dasg', rollNumber: '22CS003', batch: '2022', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's04', name: 'Sneha Nair', rollNumber: '22CS004', batch: '2022', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'twitter', url: '#' }] },
    { id: 's05', name: 'Kiran Raj', rollNumber: '22CS005', batch: '2022', section: 'A', links: [{ type: 'github', url: '#' }] },
    { id: 's06', name: 'Divya Krishnan', rollNumber: '22CS006', batch: '2022', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    // Section B
    { id: 's07', name: 'Aditya Sharma', rollNumber: '22CS007', batch: '2022', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }, { type: 'portfolio', url: '#' }] },
    { id: 's08', name: 'Meera Pillai', rollNumber: '22CS008', batch: '2022', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's09', name: 'Vikram Shetty', rollNumber: '22CS009', batch: '2022', section: 'B', links: [{ type: 'linkedin', url: '#' }] },
    { id: 's10', name: 'Ananya Iyer', rollNumber: '22CS010', batch: '2022', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's11', name: 'Rahul Verma', rollNumber: '22CS011', batch: '2022', section: 'B', links: [{ type: 'github', url: '#' }, { type: 'twitter', url: '#' }] },
    { id: 's12', name: 'Kavya Reddy', rollNumber: '22CS012', batch: '2022', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'portfolio', url: '#' }] },

    // ── 2023 Batch ────────────────────────────────────────────────────────────
    // Section A
    { id: 's13', name: 'Ishaan Patel', rollNumber: '23CS001', batch: '2023', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's14', name: 'Tanvi Joshi', rollNumber: '23CS002', batch: '2023', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }, { type: 'portfolio', url: '#' }] },
    { id: 's15', name: 'Dev Kulkarni', rollNumber: '23CS003', batch: '2023', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's16', name: 'Nisha Menon', rollNumber: '23CS004', batch: '2023', section: 'A', links: [{ type: 'linkedin', url: '#' }] },
    { id: 's17', name: 'Siddharth Bose', rollNumber: '23CS005', batch: '2023', section: 'A', links: [{ type: 'github', url: '#' }, { type: 'linkedin', url: '#' }] },
    { id: 's18', name: 'Pooja Rao', rollNumber: '23CS006', batch: '2023', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'twitter', url: '#' }] },
    // Section B
    { id: 's19', name: 'Nikhil Gupta', rollNumber: '23CS007', batch: '2023', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's20', name: 'Riya Desai', rollNumber: '23CS008', batch: '2023', section: 'B', links: [{ type: 'github', url: '#' }, { type: 'portfolio', url: '#' }] },
    { id: 's21', name: 'Aman Saxena', rollNumber: '23CS009', batch: '2023', section: 'B', links: [{ type: 'linkedin', url: '#' }] },
    { id: 's22', name: 'Preeti Nandi', rollNumber: '23CS010', batch: '2023', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's23', name: 'Suresh Kumar', rollNumber: '23CS011', batch: '2023', section: 'B', links: [{ type: 'github', url: '#' }, { type: 'twitter', url: '#' }] },
    { id: 's24', name: 'Ankita Singh', rollNumber: '23CS012', batch: '2023', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }, { type: 'portfolio', url: '#' }] },

    // ── 2024 Batch ────────────────────────────────────────────────────────────
    // Section A
    { id: 's25', name: 'Kunal Thakur', rollNumber: '24CS001', batch: '2024', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's26', name: 'Shreya Pandey', rollNumber: '24CS002', batch: '2024', section: 'A', links: [{ type: 'linkedin', url: '#' }] },
    { id: 's27', name: 'Varun Mishra', rollNumber: '24CS003', batch: '2024', section: 'A', links: [{ type: 'github', url: '#' }, { type: 'linkedin', url: '#' }] },
    { id: 's28', name: 'Lakshmi Prasad', rollNumber: '24CS004', batch: '2024', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'twitter', url: '#' }] },
    { id: 's29', name: 'Harish Venkat', rollNumber: '24CS005', batch: '2024', section: 'A', links: [{ type: 'github', url: '#' }] },
    { id: 's30', name: 'Simran Kaur', rollNumber: '24CS006', batch: '2024', section: 'A', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }, { type: 'portfolio', url: '#' }] },
    // Section B
    { id: 's31', name: 'Ravi Teja', rollNumber: '24CS007', batch: '2024', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's32', name: 'Mansi Agarwal', rollNumber: '24CS008', batch: '2024', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
    { id: 's33', name: 'Deepak Bhat', rollNumber: '24CS009', batch: '2024', section: 'B', links: [{ type: 'github', url: '#' }, { type: 'portfolio', url: '#' }] },
    { id: 's34', name: 'Nandita Roy', rollNumber: '24CS010', batch: '2024', section: 'B', links: [{ type: 'linkedin', url: '#' }] },
    { id: 's35', name: 'Yash Choudhary', rollNumber: '24CS011', batch: '2024', section: 'B', links: [{ type: 'github', url: '#' }, { type: 'twitter', url: '#' }] },
    { id: 's36', name: 'Ishita Malhotra', rollNumber: '24CS012', batch: '2024', section: 'B', links: [{ type: 'linkedin', url: '#' }, { type: 'github', url: '#' }] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Returns initials from a name (up to 2 chars) */
const getInitials = (name: string) =>
    name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

/** Deterministic hue from a string — to give each avatar a unique color */
const nameToHue = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
};

const LINK_CONFIG: Record<
    StudentLink['type'],
    { icon: React.FC<{ className?: string }>; label: string; color: string }
> = {
    linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'text-blue-400 hover:text-blue-300' },
    github: { icon: Github, label: 'GitHub', color: 'text-gray-300 hover:text-white' },
    portfolio: { icon: Globe, label: 'Portfolio', color: 'text-cyan-400 hover:text-cyan-300' },
    twitter: { icon: Twitter, label: 'Twitter', color: 'text-sky-400 hover:text-sky-300' },
    other: { icon: ExternalLink, label: 'Link', color: 'text-gray-400 hover:text-gray-200' },
};

// ─── Student Card ─────────────────────────────────────────────────────────────
const StudentCard: React.FC<{ student: Student; onClick: () => void }> = ({ student, onClick }) => {
    const hue = nameToHue(student.name);
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const avatarStyle = isLight
        ? { background: `radial-gradient(circle at 40% 40%, hsl(${hue},40%,82%), hsl(${hue},25%,90%))`, color: `hsl(${hue},60%,30%)` }
        : { background: `radial-gradient(circle at 40% 40%, hsl(${hue},50%,20%), hsl(${hue},30%,10%))`, color: `hsl(${hue},80%,75%)` };

    const rollBadgeStyle = isLight
        ? { color: `hsl(${hue},60%,30%)`, borderColor: `hsl(${hue},50%,70%)`, backgroundColor: `hsl(${hue},40%,92%)` }
        : { color: `hsl(${hue},75%,65%)`, borderColor: `hsl(${hue},50%,30%)`, backgroundColor: `hsl(${hue},40%,12%)` };

    return (
        <div
            onClick={onClick}
            className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col items-center text-center
                 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
        >
            {/* Subtle glow on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                    background: `radial-gradient(ellipse at 50% 0%, hsla(${hue},60%,50%,0.08) 0%, transparent 70%)`,
                }}
            />

            {/* Top decorative line */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `hsl(${hue},70%,60%)` }}
            />

            {/* Avatar */}
            <div className="relative mb-4">
                {student.photo ? (
                    <img
                        src={student.photo}
                        alt={student.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 group-hover:border-cyan-500/60 transition-colors duration-300"
                    />
                ) : (
                    <div
                        className="w-20 h-20 rounded-full border-2 border-gray-700 group-hover:border-cyan-500/60 flex items-center justify-center
                       text-xl font-bold transition-colors duration-300 select-none"
                        style={avatarStyle}
                    >
                        {getInitials(student.name)}
                    </div>
                )}
                {/* Subtle ring pulse on hover */}
                <div
                    className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `0 0 18px 4px hsl(${hue},60%,50%)` }}
                />
            </div>

            {/* Identity */}
            <h3
                className="font-semibold text-gray-100 text-sm leading-tight mb-2 group-hover:text-white transition-colors w-full line-clamp-2 break-words px-1"
                title={student.name}
            >
                {student.name}
            </h3>
            <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border mb-4"
                style={rollBadgeStyle}
            >
                {student.rollNumber}
            </span>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-3 mt-auto">
                {student.links.map((link, i) => {
                    const cfg = LINK_CONFIG[link.type] ?? LINK_CONFIG.other;
                    const Icon = cfg.icon;
                    return (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.label ?? cfg.label}
                            className={`${cfg.color} transition-all duration-200 hover:scale-125`}
                            onClick={(e) => link.url === '#' && e.preventDefault()}
                        >
                            <Icon className="w-4 h-4" />
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Section Panel ─────────────────────────────────────────────────────────────
const SectionPanel: React.FC<{ section: string; students: Student[]; onSelect: (s: Student) => void }> = ({ section, students, onSelect }) => (
    <div>
        <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                Section {section}
            </h3>
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-[11px] text-gray-600 font-mono">{students.length} students</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {students.map((s) => (
                <StudentCard key={s.id} student={s} onClick={() => onSelect(s)} />
            ))}
        </div>
    </div>
);

// ─── Batch Block ─────────────────────────────────────────────────────────────
const BatchBlock: React.FC<{ batch: string; students: Student[]; onSelect: (s: Student) => void }> = ({ batch, students, onSelect }) => {
    const sections = useMemo(() => {
        const map = new Map<string, Student[]>();
        students.forEach((s) => {
            if (!map.has(s.section)) map.set(s.section, []);
            map.get(s.section)!.push(s);
        });
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [students]);

    return (
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden">
            {/* Batch header */}
            <div className="px-6 py-5 border-b border-gray-800 bg-gradient-to-r from-cyan-900/15 to-blue-900/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest mb-0.5">
                        Batch
                    </div>
                    <h2 className="text-xl font-bold text-white">{batch}</h2>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">{students.length} students</span>
                    <span className="text-xs text-gray-700">·</span>
                    <span className="text-xs text-gray-500 font-mono">{sections.length} sections</span>
                </div>
            </div>

            {/* Sections */}
            <div className="p-6 space-y-8">
                {sections.map(([sec, list]) => (
                    <SectionPanel key={sec} section={sec} students={list} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
};

// ─── Student Modal ────────────────────────────────────────────────────────────
const StudentModal: React.FC<{ student: Student; onClose: () => void }> = ({ student, onClose }) => {
    const hue = nameToHue(student.name);
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const avatarStyle = isLight
        ? { background: `radial-gradient(circle at 40% 40%, hsl(${hue},40%,82%), hsl(${hue},25%,90%))`, color: `hsl(${hue},60%,30%)` }
        : { background: `radial-gradient(circle at 40% 40%, hsl(${hue},50%,20%), hsl(${hue},30%,10%))`, color: `hsl(${hue},80%,75%)` };

    const rollBadgeStyle = isLight
        ? { color: `hsl(${hue},60%,30%)`, borderColor: `hsl(${hue},50%,70%)`, backgroundColor: `hsl(${hue},40%,92%)` }
        : { color: `hsl(${hue},75%,65%)`, borderColor: `hsl(${hue},50%,30%)`, backgroundColor: `hsl(${hue},40%,12%)` };

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 overflow-hidden shadow-2xl mt-16"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Decorative glow */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 opacity-20 pointer-events-none rounded-full blur-3xl"
                    style={{ background: `hsl(${hue},60%,50%)` }}
                />

                <div className="flex flex-col items-center text-center relative z-10 mt-4">
                    {/* Avatar */}
                    <div className="relative mb-6">
                        {student.photo ? (
                            <img
                                src={student.photo}
                                alt={student.name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-800 shadow-xl"
                            />
                        ) : (
                            <div
                                className="w-32 h-32 rounded-full border-4 border-gray-800 shadow-xl flex items-center justify-center text-4xl font-bold select-none"
                                style={avatarStyle}
                            >
                                {getInitials(student.name)}
                            </div>
                        )}
                    </div>

                    {/* Identity */}
                    <h2 className="text-2xl font-bold text-white mb-2 break-words w-full">{student.name}</h2>

                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span
                            className="text-sm font-mono font-bold px-3 py-1 rounded-full border"
                            style={rollBadgeStyle}
                        >
                            {student.rollNumber}
                        </span>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                            Batch {student.batch} • Sec {student.section}
                        </span>
                    </div>

                    {/* Links */}
                    <div className="w-full pt-6 border-t border-gray-800 flex flex-wrap justify-center gap-4">
                        {student.links.map((link, i) => {
                            const cfg = LINK_CONFIG[link.type] ?? LINK_CONFIG.other;
                            const Icon = cfg.icon;
                            return (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={link.label ?? cfg.label}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-all ${cfg.color}`}
                                    onClick={(e) => link.url === '#' && e.preventDefault()}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{link.label ?? cfg.label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const StudentsPage: React.FC = () => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [query, setQuery] = useState('');
    const [batchFilter, setBatchFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');

    // Derived filter options
    const batches = useMemo(
        () => ['All', ...Array.from(new Set(STUDENTS.map((s) => s.batch))).sort((a, b) => Number(b) - Number(a))],
        []
    );
    const sections = useMemo(
        () => ['All', ...Array.from(new Set(STUDENTS.map((s) => s.section))).sort()],
        []
    );

    // Filtered + grouped by batch
    const batchGroups = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = STUDENTS.filter((s) => {
            if (batchFilter !== 'All' && s.batch !== batchFilter) return false;
            if (sectionFilter !== 'All' && s.section !== sectionFilter) return false;
            if (q && !s.name.toLowerCase().includes(q) && !s.rollNumber.toLowerCase().includes(q)) return false;
            return true;
        });

        const map = new Map<string, Student[]>();
        filtered.forEach((s) => {
            if (!map.has(s.batch)) map.set(s.batch, []);
            map.get(s.batch)!.push(s);
        });
        return Array.from(map.entries()).sort(([a], [b]) => Number(b) - Number(a)); // newest batch first
    }, [query, batchFilter, sectionFilter]);

    const totalVisible = batchGroups.reduce((sum, [, arr]) => sum + arr.length, 0);

    return (
        <div className="space-y-10">
            {/* ── Page Header ───────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 p-8 md:p-10">
                {/* Dot grid background */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-3 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            Department Directory
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
                            The Constellation
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-xl">
                            Every student in the department—batch by batch, section by section. The brightest minds securing tomorrow's digital world.
                        </p>
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-4 flex-shrink-0">
                        {[
                            { label: 'Batches', value: batches.length - 1 },
                            { label: 'Students', value: STUDENTS.length + '+' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-gray-900/70 border border-gray-800 rounded-2xl px-5 py-4 text-center min-w-[80px]">
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Controls ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or roll number..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-sm
                       focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50
                       placeholder-gray-600 transition-colors"
                    />
                </div>

                {/* Batch filter pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mr-1">Batch:</span>
                    {batches.map((b) => (
                        <button
                            key={b}
                            onClick={() => setBatchFilter(b)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${batchFilter === b
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-cyan-500/40 hover:text-gray-200'
                                }`}
                        >
                            {b}
                        </button>
                    ))}
                </div>

                {/* Section filter pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mr-1">Section:</span>
                    {sections.map((sec) => (
                        <button
                            key={sec}
                            onClick={() => setSectionFilter(sec)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sectionFilter === sec
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-cyan-500/40 hover:text-gray-200'
                                }`}
                        >
                            {sec}
                        </button>
                    ))}
                </div>
            </div>

            {/* Result count */}
            {(query || batchFilter !== 'All' || sectionFilter !== 'All') && (
                <p className="text-sm text-gray-500">
                    Showing <span className="text-cyan-400 font-semibold">{totalVisible}</span> student{totalVisible !== 1 ? 's' : ''}
                    {query && <> matching "<span className="text-gray-300">{query}</span>"</>}
                </p>
            )}

            {/* ── Batch Groups ──────────────────────────────────────────────────── */}
            {batchGroups.length > 0 ? (
                <div className="space-y-8">
                    {batchGroups.map(([batch, students]) => (
                        <BatchBlock key={batch} batch={batch} students={students} onSelect={setSelectedStudent} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border border-gray-800 rounded-3xl bg-gray-900/40">
                    <User className="w-14 h-14 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-1">No students found</p>
                    <p className="text-gray-600 text-sm">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Student Modal */}
            {selectedStudent && (
                <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            )}
        </div>
    );
};

export default StudentsPage;
