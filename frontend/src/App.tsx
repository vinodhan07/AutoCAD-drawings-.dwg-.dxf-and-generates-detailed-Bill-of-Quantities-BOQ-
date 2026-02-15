import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import {
    Upload,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ArrowRight,
    BarChart3,
    FileDown,
    Flower2,
    Zap,
    Calculator,
    LogIn,
    LogOut,
    Mail,
    User,
} from 'lucide-react';

interface BOQItem {
    item_no: number;
    component: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    total: number;
}

interface GoogleUser {
    name: string;
    email: string;
    picture: string;
    access_token: string;
}

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [boqData, setBoqData] = useState<BOQItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [user, setUser] = useState<GoogleUser | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Google Login
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch user info using the access token
                const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                setUser({
                    name: userInfo.data.name,
                    email: userInfo.data.email,
                    picture: userInfo.data.picture,
                    access_token: tokenResponse.access_token,
                });
                setError(null);
            } catch {
                setError('Failed to fetch user info after login.');
            }
        },
        onError: () => {
            setError('Google login failed. Please try again.');
        },
        scope: 'https://www.googleapis.com/auth/gmail.send email profile',
    });

    const handleLogout = useCallback(() => {
        googleLogout();
        setUser(null);
        setEmailStatus(null);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(false);
            setEmailStatus(null);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
            setSuccess(false);
            setEmailStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!user) {
            login();
            return;
        }
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccess(false);
        setEmailStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        // Include auth data if logged in
        if (user) {
            formData.append('access_token', user.access_token);
            formData.append('user_email', user.email);
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/process`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Response now has { boq: [...], email_status: {...} }
            const responseData = response.data;
            const boqItems = (responseData.boq || responseData).map((item: BOQItem) => ({
                ...item,
                rate: item.rate ?? 0,
                total: item.total ?? Number((item.quantity * (item.rate ?? 0)).toFixed(2)),
            }));

            setBoqData(boqItems);
            setSuccess(true);

            // Set email status if present
            if (responseData.email_status) {
                setEmailStatus(responseData.email_status);
            }
        } catch (err) {
            console.error(err);
            setError('Processing failed. Please check that the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (index: number, newRate: string) => {
        const rate = parseFloat(newRate) || 0;
        const updatedBoq = [...boqData];
        updatedBoq[index].rate = rate;
        updatedBoq[index].total = Number((updatedBoq[index].quantity * rate).toFixed(2));
        setBoqData(updatedBoq);
    };

    const calculateGrandTotal = () => {
        return boqData.reduce((sum, item) => sum + item.total, 0).toFixed(2);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            boqData.map((item) => ({
                'Item No': item.item_no,
                Component: item.component,
                Description: item.description,
                Quantity: item.quantity,
                Unit: item.unit,
                Rate: item.rate,
                Total: item.total,
            }))
        );
        XLSX.utils.sheet_add_aoa(
            worksheet,
            [['', '', '', '', '', 'Grand Total', calculateGrandTotal()]],
            { origin: -1 }
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BOQ');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(data, 'CAD_BOQ_Report.xlsx');
    };

    return (
        <div className="bg-pastel" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* ── Header ─────────────────────────────── */}
            <header
                style={{
                    background: 'rgba(250, 247, 242, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(139, 126, 200, 0.08)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}
            >
                <div
                    style={{
                        maxWidth: '1100px',
                        margin: '0 auto',
                        padding: '16px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, rgba(139, 126, 200, 0.12), rgba(126, 200, 184, 0.1))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(139, 126, 200, 0.12)',
                            }}
                        >
                            <Flower2 size={20} color="var(--accent-primary)" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1
                                className="font-display"
                                style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 400,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.2,
                                }}
                            >
                                CAD <span className="gradient-text">to BOQ</span>
                            </h1>
                            <p
                                style={{
                                    fontSize: '0.6875rem',
                                    color: 'var(--text-muted)',
                                    letterSpacing: '0.04em',
                                    fontWeight: 500,
                                }}
                            >
                                Quantity Extraction Engine
                            </p>
                        </div>
                    </div>

                    {/* Auth Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="pill pill-lavender">
                            <Sparkles size={10} />
                            v1.0
                        </span>

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 14px',
                                    background: 'rgba(130, 184, 104, 0.06)',
                                    border: '1px solid rgba(130, 184, 104, 0.15)',
                                    borderRadius: '50px',
                                }}>
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            border: '1.5px solid rgba(130, 184, 104, 0.3)',
                                        }}
                                    />
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        maxWidth: '120px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {user.name}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '6px 12px',
                                        fontSize: '0.6875rem',
                                        fontWeight: 600,
                                        color: 'var(--accent-red)',
                                        background: 'rgba(212, 104, 122, 0.06)',
                                        border: '1px solid rgba(212, 104, 122, 0.15)',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <LogOut size={12} />
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => login()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 18px',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    color: 'white',
                                    background: 'linear-gradient(135deg, var(--accent-primary), #9b8dd6)',
                                    border: 'none',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(139, 126, 200, 0.2)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <LogIn size={14} />
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Main Content ───────────────────────── */}
            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 24px', position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                {boqData.length === 0 && (
                    <div
                        className="animate-fade-in-up"
                        style={{ textAlign: 'center', marginBottom: '56px' }}
                    >
                        <div className="divider-dots" style={{ maxWidth: '100px', margin: '0 auto 28px' }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                opacity: 0.5,
                            }} />
                        </div>

                        <h2
                            className="font-display"
                            style={{
                                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                                fontWeight: 400,
                                letterSpacing: '-0.01em',
                                lineHeight: 1.2,
                                marginBottom: '20px',
                                color: 'var(--text-primary)',
                            }}
                        >
                            Transform CAD Drawings
                            <br />
                            <span
                                className="gradient-text-warm"
                                style={{ fontStyle: 'italic' }}
                            >
                                into Bill of Quantities
                            </span>
                        </h2>
                        <p
                            style={{
                                fontSize: '1.0625rem',
                                color: 'var(--text-secondary)',
                                maxWidth: '480px',
                                margin: '0 auto',
                                lineHeight: 1.7,
                                fontWeight: 300,
                            }}
                        >
                            Upload your DWG files and let the engine automatically extract
                            quantities, generate professional BOQ reports, and export to Excel.
                        </p>

                        {/* Feature pills */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '32px',
                                flexWrap: 'wrap',
                            }}
                        >
                            {[
                                { icon: <Zap size={12} />, label: 'Auto Extraction', cls: 'pill-lavender' },
                                { icon: <BarChart3 size={12} />, label: 'Live Totals', cls: 'pill-mint' },
                                { icon: <FileDown size={12} />, label: 'Excel Export', cls: 'pill-peach' },
                                { icon: <Mail size={12} />, label: 'Email Report', cls: 'pill-green' },
                            ].map((pill, i) => (
                                <div
                                    key={i}
                                    className={`pill ${pill.cls} stagger-${i + 1} animate-fade-in-up`}
                                    style={{ fontSize: '0.6875rem' }}
                                >
                                    {pill.icon}
                                    {pill.label}
                                </div>
                            ))}
                        </div>

                        {/* Login prompt if not logged in */}
                        {!user && (
                            <p
                                className="animate-fade-in-up stagger-4"
                                style={{
                                    marginTop: '24px',
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-muted)',
                                    fontStyle: 'italic',
                                }}
                            >
                                <User size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Sign in with Google to get BOQ reports emailed automatically
                            </p>
                        )}
                    </div>
                )}

                {/* Upload Card */}
                <div
                    className="soft-card animate-fade-in-up stagger-2"
                    style={{ padding: '44px', marginBottom: '36px' }}
                >
                    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '24px',
                        }}>
                            <Upload size={13} style={{ color: 'var(--accent-primary)' }} strokeWidth={2} />
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                                letterSpacing: '0.03em',
                            }}>
                                Upload Drawing
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(139, 126, 200, 0.1)' }} />
                            {user && (
                                <span style={{
                                    fontSize: '0.6875rem',
                                    color: 'var(--accent-green)',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}>
                                    <Mail size={11} />
                                    Email will be sent to {user.email}
                                </span>
                            )}
                        </div>

                        {/* Login Required Gate */}
                        {!user ? (
                            <div
                                style={{
                                    padding: '52px 24px',
                                    textAlign: 'center',
                                    borderRadius: '16px',
                                    background: 'rgba(139, 126, 200, 0.03)',
                                    border: '2px dashed rgba(139, 126, 200, 0.15)',
                                }}
                            >
                                <div
                                    className="animate-float"
                                    style={{
                                        width: '72px',
                                        height: '72px',
                                        borderRadius: '20px',
                                        background: 'linear-gradient(135deg, rgba(139, 126, 200, 0.1), rgba(232, 168, 124, 0.08))',
                                        border: '1px solid rgba(139, 126, 200, 0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                    }}
                                >
                                    <LogIn size={28} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
                                </div>
                                <h3
                                    className="font-display"
                                    style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 400,
                                        color: 'var(--text-primary)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Sign in to get started
                                </h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '24px',
                                    maxWidth: '320px',
                                    margin: '0 auto 24px',
                                    lineHeight: 1.6,
                                }}>
                                    Sign in with your Google account to upload CAD drawings and receive BOQ reports via email.
                                </p>
                                <button
                                    onClick={() => login()}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '12px 28px',
                                        fontSize: '0.9375rem',
                                        fontWeight: 600,
                                        color: 'white',
                                        background: 'linear-gradient(135deg, var(--accent-primary), #9b8dd6)',
                                        border: 'none',
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 18px rgba(139, 126, 200, 0.25)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <LogIn size={18} />
                                    Sign in with Google
                                </button>
                            </div>
                        ) : (
                            /* Drop Zone — only shown when logged in */
                            <div
                                className={`drop-zone ${file ? 'file-selected' : ''}`}
                                style={{
                                    padding: '52px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    borderColor: dragActive ? 'var(--accent-primary)' : undefined,
                                    background: dragActive ? 'rgba(139, 126, 200, 0.04)' : undefined,
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div className="animate-fade-in-up">
                                        <CheckCircle2
                                            size={44}
                                            style={{ color: 'var(--accent-green)', margin: '0 auto 16px' }}
                                            strokeWidth={1.5}
                                        />
                                        <p
                                            style={{
                                                fontSize: '0.9375rem',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            {file.name}
                                        </p>
                                        <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB — ready to process
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="animate-float"
                                            style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '18px',
                                                background: 'linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(126, 200, 184, 0.08))',
                                                border: '1px solid rgba(139, 126, 200, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 24px',
                                            }}
                                        >
                                            <Upload size={24} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
                                        </div>
                                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                                                Click to upload
                                            </span>{' '}
                                            or drag & drop your drawing
                                        </p>
                                        <p className="mono" style={{
                                            fontSize: '0.6875rem',
                                            color: 'var(--text-muted)',
                                            letterSpacing: '0.03em',
                                        }}>
                                            accepts .dwg and .dxf files
                                        </p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".dwg,.dxf"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}

                        {/* Action Button — only show when logged in */}
                        {user && (
                            <button
                                className="btn-primary"
                                onClick={handleUpload}
                                disabled={!file || loading}
                                style={{ width: '100%', marginTop: '20px', padding: '15px 24px' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spinner" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet size={18} />
                                        Generate BOQ
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        )}

                        {/* Error State */}
                        {error && (
                            <div
                                className="animate-fade-in-up"
                                style={{
                                    marginTop: '16px',
                                    padding: '12px 16px',
                                    border: '1px solid rgba(212, 104, 122, 0.2)',
                                    borderRadius: '12px',
                                    background: 'rgba(212, 104, 122, 0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.8125rem',
                                    color: 'var(--accent-red)',
                                }}
                            >
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Success State */}
                        {success && boqData.length > 0 && (
                            <div
                                className="animate-fade-in-up"
                                style={{
                                    marginTop: '16px',
                                    padding: '12px 16px',
                                    border: '1px solid rgba(130, 184, 104, 0.2)',
                                    borderRadius: '12px',
                                    background: 'rgba(130, 184, 104, 0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.8125rem',
                                    color: 'var(--accent-green)',
                                }}
                            >
                                <CheckCircle2 size={16} />
                                Successfully extracted {boqData.length} item{boqData.length > 1 ? 's' : ''} with estimated costs.
                            </div>
                        )}

                        {/* Email Status */}
                        {emailStatus && (
                            <div
                                className="animate-fade-in-up"
                                style={{
                                    marginTop: '10px',
                                    padding: '12px 16px',
                                    border: `1px solid ${emailStatus.success ? 'rgba(139, 126, 200, 0.2)' : 'rgba(212, 104, 122, 0.2)'}`,
                                    borderRadius: '12px',
                                    background: emailStatus.success ? 'rgba(139, 126, 200, 0.04)' : 'rgba(212, 104, 122, 0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.8125rem',
                                    color: emailStatus.success ? 'var(--accent-primary)' : 'var(--accent-red)',
                                }}
                            >
                                <Mail size={16} />
                                {emailStatus.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Estimation Summary Card ─────────── */}
                {boqData.length > 0 && (
                    <div
                        className="soft-card animate-fade-in-up"
                        style={{
                            padding: '28px 32px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '20px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(139, 126, 200, 0.1), rgba(232, 168, 124, 0.08))',
                                    border: '1px solid rgba(139, 126, 200, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Calculator size={20} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: 500,
                                    marginBottom: '2px',
                                    letterSpacing: '0.03em',
                                }}>
                                    Estimated Project Cost
                                </p>
                                <p
                                    className="font-display"
                                    style={{
                                        fontSize: '1.75rem',
                                        fontWeight: 500,
                                        color: Number(calculateGrandTotal()) > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {Number(calculateGrandTotal()) > 0
                                        ? `₹${Number(calculateGrandTotal()).toLocaleString()}`
                                        : '—'}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '8px 18px',
                                background: 'rgba(139, 126, 200, 0.04)',
                                borderRadius: '12px',
                                border: '1px solid rgba(139, 126, 200, 0.08)',
                            }}>
                                <p className="mono" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                    {boqData.length}
                                </p>
                                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Line Items
                                </p>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '8px 18px',
                                background: 'rgba(126, 200, 184, 0.04)',
                                borderRadius: '12px',
                                border: '1px solid rgba(126, 200, 184, 0.08)',
                            }}>
                                <p className="mono" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                                    {boqData.filter(i => i.rate > 0).length}
                                </p>
                                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Estimated
                                </p>
                            </div>
                            {emailStatus?.success && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '8px 18px',
                                    background: 'rgba(139, 126, 200, 0.04)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(139, 126, 200, 0.08)',
                                }}>
                                    <p className="mono" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                        <Mail size={16} />
                                    </p>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Emailed
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── BOQ Results Table ─────────────────── */}
                {boqData.length > 0 && (
                    <div className="soft-card animate-fade-in-up" style={{ overflow: 'hidden' }}>
                        {/* Table Header Bar */}
                        <div
                            style={{
                                padding: '20px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px',
                                borderBottom: '1px solid rgba(139, 126, 200, 0.08)',
                                background: 'rgba(243, 237, 228, 0.4)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
                                <h2
                                    className="font-display"
                                    style={{
                                        fontSize: '1.125rem',
                                        fontWeight: 400,
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    Bill of Quantities
                                </h2>
                                <span className="pill pill-lavender" style={{ fontSize: '0.625rem' }}>
                                    {boqData.length} items
                                </span>
                            </div>

                            <button className="btn-export" onClick={exportToExcel}>
                                <Download size={14} />
                                Export .xlsx
                            </button>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table className="boq-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                                        <th>Component</th>
                                        <th>Description</th>
                                        <th style={{ textAlign: 'right' }}>Qty</th>
                                        <th style={{ width: '70px', textAlign: 'center' }}>Unit</th>
                                        <th style={{ textAlign: 'right', width: '140px' }}>Rate (₹)</th>
                                        <th style={{ textAlign: 'right', width: '140px' }}>Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boqData.map((item, index) => (
                                        <tr key={index}>
                                            <td
                                                className="mono"
                                                style={{
                                                    textAlign: 'center',
                                                    fontWeight: 500,
                                                    color: 'var(--accent-primary)',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {String(item.item_no).padStart(2, '0')}
                                            </td>
                                            <td style={{
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                fontSize: '0.875rem',
                                            }}>
                                                {item.component}
                                            </td>
                                            <td style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.8125rem',
                                                fontWeight: 300,
                                            }}>
                                                {item.description}
                                            </td>
                                            <td
                                                className="mono"
                                                style={{
                                                    textAlign: 'right',
                                                    fontWeight: 500,
                                                    color: 'var(--accent-secondary)',
                                                }}
                                            >
                                                {item.quantity.toLocaleString()}
                                            </td>
                                            <td
                                                className="mono"
                                                style={{
                                                    textAlign: 'center',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '0.6875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                }}
                                            >
                                                {item.unit}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="rate-input"
                                                    value={item.rate || ''}
                                                    placeholder="0.00"
                                                    onChange={(e) => handleRateChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td
                                                className="mono"
                                                style={{
                                                    textAlign: 'right',
                                                    fontWeight: 600,
                                                    color:
                                                        item.total > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {item.total > 0 ? `₹${item.total.toLocaleString()}` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'right' }}>
                                            <span
                                                className="mono"
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-secondary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                }}
                                            >
                                                Grand Total
                                            </span>
                                        </td>
                                        <td
                                            colSpan={2}
                                            className="mono"
                                            style={{
                                                textAlign: 'right',
                                                fontWeight: 700,
                                                fontSize: '1.125rem',
                                                color: Number(calculateGrandTotal()) > 0
                                                    ? 'var(--accent-green)'
                                                    : 'var(--text-muted)',
                                            }}
                                        >
                                            {Number(calculateGrandTotal()) > 0
                                                ? `₹${Number(calculateGrandTotal()).toLocaleString()}`
                                                : '—'}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* ── Footer ─────────────────────────────── */}
            <footer
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '40px 24px 32px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <div className="divider-dots" style={{ marginBottom: '20px' }}>
                    <span style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: 'var(--accent-blush)',
                        opacity: 0.4,
                    }} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                        gap: '8px',
                    }}
                >
                    <span className="font-display" style={{ fontStyle: 'italic', fontSize: '0.8125rem' }}>
                        © 2026 CAD to BOQ Engine
                    </span>
                    <span className="mono" style={{ fontSize: '0.6875rem', letterSpacing: '0.03em' }}>
                        FastAPI + React
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default App;
