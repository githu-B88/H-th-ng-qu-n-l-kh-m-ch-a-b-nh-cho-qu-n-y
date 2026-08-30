import React, { useState, useEffect } from 'react';
import { BacSi, HoSoKham, NguoiDung } from './types';
import { sqliteService } from './db/sqlite-service';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExamDesk } from './components/Examination/ExamDesk';
import { PrescriptionPrint } from './components/Examination/PrescriptionPrint';
import { PrintTemplate } from './components/PrintTemplate/PrintTemplate';
import { MedicalRecordsList } from './components/Records/MedicalRecordsList';
import { PatientManager } from './components/Patients/PatientManager';
import { DoctorManager } from './components/Doctors/DoctorManager';
import { DiseaseTemplateManager } from './components/Templates/DiseaseTemplateManager';
import { CatalogManager } from './components/Catalog/CatalogManager';
import { ClinicReports } from './components/Reports/ClinicReports';
import { DatabaseSettings } from './components/Database/DatabaseSettings';
import { Login } from './components/Auth/Login';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Activity, Database, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<NguoiDung | null>(() => {
    try {
      const saved = sessionStorage.getItem('clinic_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<BacSi | null>(null);
  const [todayExamCount, setTodayExamCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  // Cross-component triggers
  const [printRecord, setPrintRecord] = useState<HoSoKham | null>(null);
  const [examPatientId, setExamPatientId] = useState<number | null>(null);
  const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);

  const refreshBadges = () => {
    try {
      const stats = sqliteService.getClinicStatistics();
      setLowStockCount(stats.lowStockCount || 0);
      const today = new Date().toISOString().split('T')[0];
      const recordsToday = sqliteService.getHoSoKhamList({ tuNgay: today, denNgay: today });
      setTodayExamCount(recordsToday.length);
    } catch {
      // Ignore
    }
  };

  // Initialize SQLite database
  useEffect(() => {
    sqliteService
      .init()
      .then(() => {
        setIsDbReady(true);
        const docs = sqliteService.getBacSiList();
        setDoctors(docs);
        if (currentUser && currentUser.id_bac_si) {
          const doc = docs.find((d) => d.id === currentUser.id_bac_si);
          if (doc) setCurrentDoctor(doc);
        } else if (docs.length > 0) {
          setCurrentDoctor(docs[0]);
        }
        refreshBadges();
      })
      .catch((err) => {
        console.error('Failed to initialize SQLite:', err);
      });

    const unsubscribe = sqliteService.subscribe(() => {
      const docs = sqliteService.getBacSiList();
      setDoctors(docs);
      if (!currentDoctor && docs.length > 0) {
        setCurrentDoctor(docs[0]);
      }
      refreshBadges();
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = (user: NguoiDung) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('clinic_current_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
    const docs = sqliteService.getBacSiList();
    setDoctors(docs);
    if (user.id_bac_si) {
      const matched = docs.find((d) => d.id === user.id_bac_si);
      if (matched) setCurrentDoctor(matched);
    } else if (docs.length > 0) {
      setCurrentDoctor(docs[0]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('clinic_current_user');
    } catch {
      // Ignore
    }
  };

  const handleStartExamForPatient = (patientId: number) => {
    setExamPatientId(patientId);
    setActiveTab('kham_benh');
  };

  const handleOpenPrint = (record: HoSoKham) => {
    setPrintRecord(record);
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold">Khởi tạo Cơ Sở Dữ Liệu SQLite Offline...</h2>
          <p className="text-xs text-slate-400">
            Đang nạp bảng dữ liệu phòng khám nội bộ cơ quan
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the Login screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-sky-500 selection:text-white ">
      {/* Top Application Header */}
      <div className="print:hidden">
        <Header
        activeTab={activeTab}
        bacSiList={doctors}
        doctors={doctors}
        selectedBacSiId={currentDoctor?.id || (doctors[0]?.id ?? 1)}
        currentDoctor={currentDoctor}
        currentUser={currentUser}
        onSelectDoctor={(doc) => setCurrentDoctor(doc)}
        onSelectBacSiId={(id) => {
          const doc = doctors.find((d) => d.id === id);
          if (doc) setCurrentDoctor(doc);
        }}
        onQuickNewExam={() => {
          setExamPatientId(null);
          setActiveTab('kham_benh');
        }}
        onLogout={handleLogout}
      />
      </div>
      <div className="flex-1 flex overflow-hidden print:hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onTabChange={(t) => setActiveTab(t)}
          examCountToday={todayExamCount}
          lowStockCount={lowStockCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              onStartExamForPatient={handleStartExamForPatient}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onQuickNewExam={() => {
                setExamPatientId(null);
                setActiveTab('kham_benh');
              }}
            />
          )}

          {activeTab === 'kham_benh' && (
            <ExamDesk
              bacSiList={doctors}
              currentDoctor={currentDoctor}
              selectedBacSiId={currentDoctor?.id || (doctors[0]?.id ?? 1)}
              onSavedAndPrint={handleOpenPrint}
              onPrintRecord={handleOpenPrint}
              onViewHistoryPatient={(pId) => {
                setHistoryPatientId(pId);
                setActiveTab('benh_nhan');
              }}
              preSelectedPatientId={examPatientId}
            />
          )}

          {(activeTab === 'ho_so_kham' || activeTab === 'ho_so_y_ba') && (
            <MedicalRecordsList
              onPrintRecord={handleOpenPrint}
              onNewExam={() => {
                setExamPatientId(null);
                setActiveTab('kham_benh');
              }}
            />
          )}

          {activeTab === 'benh_nhan' && (
            <PatientManager
              onStartExamForPatient={handleStartExamForPatient}
              initialSelectedPatientIdForHistory={historyPatientId}
            />
          )}

          {activeTab === 'bac_si' && <DoctorManager />}

          {activeTab === 'mau_benh' && <DiseaseTemplateManager />}

          {activeTab === 'danh_muc' && <CatalogManager />}

          {activeTab === 'bao_cao' && <ClinicReports />}

          {(activeTab === 'co_so_du_lieu' || activeTab === 'csdl') && <DatabaseSettings />}
        </main>
      </div>
      {/* Print Template (Hidden on screen, 100% visible on print for A4) */}
      {printRecord && <PrintTemplate record={printRecord} />}
      
      {/* Printable Prescription Modal Preview */}
      {printRecord && (
        <div className="print:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto">
            <PrescriptionPrint
              record={printRecord}
              onClose={() => setPrintRecord(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
