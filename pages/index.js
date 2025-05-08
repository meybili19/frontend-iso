'use client';

import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const [caseStudy, setCaseStudy] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [iaSolution, setIaSolution] = useState('');
  const [comparison, setComparison] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getCase = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/case');
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
      const res = await axios.post('http://127.0.0.1:8000/solve', { case: caseStudy });
      setIaSolution(res.data.ia_solution || res.data.solution);
    } catch (error) {
      alert('Error al obtener la solución IA');
    } finally {
      setIsLoading(false);
    }
  };

  const compareAnswers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/compare', {
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
      const res = await axios.post('http://127.0.0.1:8000/upload_case', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(res.data);  // Añadir esta línea para inspeccionar la respuesta
      setCaseStudy(res.data.uploaded_case);  // Verifica si la clave es correcta
      setManualInput('');
      setIaSolution('');
      setComparison('');
      alert('Caso de estudio cargado con éxito');
    } catch (error) {
      alert('Error al cargar el caso');
    } finally {
      setIsLoading(false);
    }
  };
  

  const downloadCaseAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(caseStudy, 180);
    doc.text(lines, 10, 10);
    doc.save('caso_de_estudio.pdf');
  };

  const resetAll = () => {
    setCaseStudy('');
    setManualInput('');
    setIaSolution('');
    setComparison('');
  };

  return (
    <>
      <Head>
        <title>ISO/IEC 29100 - Casos de Estudio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container mt-5">
        <h2 className="text-center text-black fw-bold display-5 mb-4">
          🛡️ ISO/IEC 29100 - Casos de Estudio
        </h2>

        <div className="text-center mb-4 d-grid gap-2 d-md-flex justify-content-md-center">
          <button className="btn btn-primary btn-lg" onClick={getCase} disabled={isLoading}>
            Generar Caso de Estudio
          </button>
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="form-control w-auto"
          />
          <button className="btn btn-outline-danger btn-lg" onClick={resetAll}>
            Limpiar Todo
          </button>
        </div>

        {isLoading && <div className="text-center mb-3">🔄 Cargando...</div>}

        {caseStudy && (
          <>
            <div className="card border-info mb-4">
              <div className="card-header bg-info text-white fs-4">Caso Generado</div>
              <div className="card-body">
                <ReactMarkdown>{caseStudy}</ReactMarkdown>
              </div>
            </div>

            <div className="text-center mb-3">
              <button className="btn btn-outline-primary" onClick={downloadCaseAsPDF}>
                Descargar Caso en PDF
              </button>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <strong>Tu Respuesta</strong>
                  </div>
                  <div className="card-body">
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
                  <div className="card-header bg-success text-white">
                    <strong>Solución Generada por IA</strong>
                  </div>
                  <div className="card-body">
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
                <div className="card-header bg-primary text-white fs-5">Resultado de la Comparación</div>
                <div className="card-body">
                  <ReactMarkdown>{comparison}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="footer">
        GRUPO 9 - CARRASCO - MAYORGA - OLIVARES - SALAS - 2025/2025
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
          background-color: #f8f9fa;
          padding: 1rem;
          font-size: 0.9rem;
          color: rgb(71, 79, 87);
          text-align: center;
        }
      `}</style>
    </>
  );
}
