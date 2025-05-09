'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const fileInputRef = useRef(null);
  const [caseStudy, setCaseStudy] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [iaSolution, setIaSolution] = useState('');
  const [comparison, setComparison] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadMessageType, setUploadMessageType] = useState('');

  const getCase = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('backend-iso-production.up.railway.app/case');
      setCaseStudy(res.data.case_study || res.data.case);
      setManualInput('');
      setIaSolution('');
      setComparison('');
    } catch (error) {
      alert('Error al generar el caso');
    } finally {
      setIsLoading(false);
    }
  };

  const getSolution = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('backend-iso-production.up.railway.app/solve', { case: caseStudy });
      setIaSolution(res.data.ia_solution || res.data.solution);
    } catch (error) {
      alert('Error al obtener la solución IA');
    } finally {
      setIsLoading(false);
    }
  };

  const compareAnswers = async () => {
    if (!manualInput.trim()) {
      setComparison('Aún no hemos recibido tu respuesta. Por favor, proporciona una respuesta para poder realizar la comparación.');
      return;
    }
  
    setIsLoading(true);
    try {
      const res = await axios.post('backend-iso-production.up.railway.app/compare', {
        case: caseStudy,
        user_solution: manualInput,
        ia_solution: iaSolution
      });
      setComparison(res.data.comparison);
    } catch (error) {
      alert('Error al comparar las respuestas');
    } finally {
      setIsLoading(false);
    }
  };
  


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);
    try {
      const res = await axios.post('backend-iso-production.up.railway.app/upload_case', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(res.data);
      setCaseStudy(res.data.uploaded_case);
      setManualInput('');
      setIaSolution('');
      setComparison('');
      setUploadMessage('Caso de estudio cargado con éxito');
      setUploadMessageType('success');
    } catch (error) {
      setUploadMessage('Error al cargar el caso. Por favor revise el formato del archivo.');
      setUploadMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uploadMessage) {
      const timer = setTimeout(() => {
        setUploadMessage('');
        setUploadMessageType('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadMessage]);

  const downloadCaseAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(caseStudy, 180);
    doc.text(lines, 10, 10);
    doc.save('caso_de_estudio.pdf');
  };

  const downloadFullReportAsPDF = () => {
    if (!caseStudy || !manualInput || !iaSolution || !comparison) {
      alert('Por favor asegúrate de haber completado todos los pasos.');
      return;
    }

    const doc = new jsPDF();
    const baseFontSize = 10;
    const titleFontSize = baseFontSize + 2;
    doc.setFontSize(baseFontSize);

    let y = 8;
    const lineHeight = 6;
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;

    const writeSection = (title, content) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(titleFontSize);
      const titleLines = doc.splitTextToSize(title, 180);
      titleLines.forEach(line => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });

      y += 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(baseFontSize);
      const contentLines = doc.splitTextToSize(content, 180);
      contentLines.forEach(line => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });

      y += 5;
    };

    writeSection('Caso de Estudio:', caseStudy);
    writeSection('Respuesta del Usuario:', manualInput);
    writeSection('Solución Generada por IA:', iaSolution);
    writeSection('Comparación:', comparison);

    doc.save('reporte_completo.pdf');
  };

  const resetAll = () => {
    setCaseStudy('');
    setManualInput('');
    setIaSolution('');
    setComparison('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };


  return (
    <>
      <Head>
        <title>ISO/IEC 29100 - Casos de Estudio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="main-content">
        <div className="container mt-5">
          <h2 className="text-center text-black fw-bold display-5 mb-4">
            🛡️ ISO/IEC 29100 - Casos de Estudio
          </h2>
          <div className="container mt-5 d-flex justify-content-end">
            <button
              onClick={resetAll}
              className="btn btn-sm btn-light text-dark border-0 d-flex align-items-center"
              title="Limpiar página"
              style={{ fontSize: '0.8rem' }}
            >
              <i className="bi bi-broom me-1"></i>🧹 Limpiar página
            </button>
          </div>
          <br></br>
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card border-secondary h-100">
                <div className="card-header bg-secondary text-white fs-5">
                  📂 Examinar caso de estudio
                </div>
                <div className="card-body text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="form-control mb-2"
                    style={{ maxWidth: '400px', margin: '0 auto' }}
                  />
                  <small className="text-muted">
                    Solo se aceptan archivos en formato .txt, .pdf o .doc/.docx
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-success h-100">
                <div
                  className="card-header text-dark fs-5"
                  style={{ backgroundColor: '#a3f979' }}
                >
                  🧠 Generar caso de estudio con IA
                </div>
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={getCase}
                    disabled={isLoading}
                  >
                    Generar Caso de Estudio
                  </button>
                </div>
              </div>
            </div>
          </div>

          {uploadMessage && (
            <div
              className={`text-center mt-4 ${uploadMessageType === 'success' ? 'text-success' : 'text-danger'}`}
              style={{ fontSize: '1.2rem' }}
            >
              {uploadMessage}
            </div>
          )}

          {isLoading && (
            <div className="loading-overlay">
              <div className="loader"></div>
            </div>
          )}

          {caseStudy && (
            <>
              <div className="card border-info mb-4">
                <div className="card-header bg-info text-white fs-4">
                  Caso Generado / Cargado
                </div>
                <div className="card-body case-study-container">
                  <ReactMarkdown>{caseStudy}</ReactMarkdown>
                </div>
              </div>

              <div className="text-center mb-3">
                <button className="btn btn-outline-primary" onClick={downloadCaseAsPDF}>
                  Descargar Caso de Estudio en PDF
                </button>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <strong>Tu Respuesta</strong>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setManualInput('')}
                        title="Limpiar tu respuesta"
                      >
                        🧹
                      </button>
                    </div>
                    <div className="card-body textarea-container">
                      <textarea
                        className="form-control"
                        rows="10"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Escribe tu solución aquí..."
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                      <strong>Solución Generada por IA</strong>
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={() => setIaSolution('')}
                        title="Limpiar solución IA"
                      >
                        🧹
                      </button>
                    </div>
                    <div className="card-body ia-solution-container">
                      {iaSolution ? (
                        <ReactMarkdown>{iaSolution}</ReactMarkdown>
                      ) : (
                        <div className="text-muted">Presiona el botón para obtener la solución.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
                <button className="btn btn-success btn-lg" onClick={getSolution} disabled={isLoading}>
                  Obtener Solución IA
                </button>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={compareAnswers}
                  disabled={!iaSolution || isLoading}
                >
                  Comparar Respuestas
                </button>
              </div>

              {comparison && (
                <div className="card border-primary mt-4">
                  <div className="card-header bg-primary text-white fs-5 d-flex justify-content-between align-items-center">
                    Resultado de la Comparación
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => setComparison('')}
                    >
                      🧹
                    </button>
                  </div>
                  <div className="card-body comparison-container">
                    <ReactMarkdown>{comparison}</ReactMarkdown>
                  </div>

                  <div className="text-center mt-3 mb-4">
                    <button
                      className="btn btn-outline-dark"
                      onClick={downloadFullReportAsPDF}
                      disabled={!caseStudy || !manualInput || !iaSolution || !comparison}
                    >
                      Descargar Reporte Completo en PDF
                    </button>

                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </main>

      <footer className="footer">
        © GRUPO 09 - CARRASCO - MAYORGA - OLIVARES - SALAS - 2025/2025
      </footer>


      <style jsx global>{`
        html,
        body {  
          height: 100%;
          margin: 0;
          padding: 0;
        }

        #__next {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
        }

        .footer {
          background-color: rgb(255, 255, 255);
          padding: 1rem;
          font-size: 0.9rem;
          color: rgb(159, 162, 165);
          text-align: center;
        }

        .col-md-6 {
          flex: 1;  /* Ambos elementos tomarán el mismo tamaño */
        }

        /* Asegurar que tanto el caso generado como la comparación tengan el mismo tamaño */
        .card-body {
          max-height: 500px; 
          overflow-y: auto;
        }

        .case-study-container {
          max-height: none !important;
          overflow: visible !important;
          padding: 30px;
}
        .comparison-container {
          height: 100%;
          padding: 30px;
        }

        .textarea-container,
        .ia-solution-container {
          height: 100%;
          padding: 10px;
          overflow-y: auto;
        }

        .textarea-container textarea {
          width: 100%;
          height: 100%;
          resize: none;
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .loader {
          border: 6px solid #f3f3f3; /* Light grey */
          border-top: 6px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </>
  );
}
