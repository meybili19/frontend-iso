import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const [caseStudy, setCaseStudy] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [iaSolution, setIaSolution] = useState('');
  const [comparison, setComparison] = useState('');

  const getCase = async () => {
    const res = await axios.get('http://localhost:8000/case');
    setCaseStudy(res.data.case_study);
    setManualInput('');
    setIaSolution('');
    setComparison('');
  };

  const getSolution = async () => {
    const res = await axios.post('http://localhost:8000/solve', { case_study: caseStudy });
    setIaSolution(res.data.ia_solution);
  };

  const compareAnswers = async () => {
    const res = await axios.post('http://localhost:8000/compare', {
      manual_response: manualInput,
      case_study: caseStudy,
      ia_solution: iaSolution
    });
    setComparison(res.data.comparison);
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

      <div className="main-content ">
        <div className="bg-white shadow rounded p-4 p-md-5 mb-5">
          <h2 className="text-center text-black fw-bold display-5 mb-4">
            🛡️ ISO/IEC 29100 - Casos de Estudio
          </h2>

          <div className="text-center mb-4 d-grid gap-2 d-md-flex justify-content-md-center">
            <button className="btn btn-primary btn-lg" onClick={getCase}>
              Generar Caso de Estudio
            </button>
            <button className="btn btn-outline-danger btn-lg" onClick={resetAll}>
              Limpiar Todo
            </button>
          </div>

          {caseStudy && (
            <div className="card border-info mb-4">
              <div className="card-header bg-info text-white fs-3 fw-bold fw-cursive">
                Caso Generado
              </div>
              <div className="card-body">
                <ReactMarkdown>{caseStudy}</ReactMarkdown>
              </div>
            </div>
          )}

          {caseStudy && (
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
          )}

          {caseStudy && (
            <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
              <button className="btn btn-success btn-lg" onClick={getSolution}>
                Obtener Solución IA
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={compareAnswers}
                disabled={!iaSolution}
              >
                Comparar Respuestas
              </button>
            </div>
          )}

          {comparison && (
            <div className="card border-primary mt-4">
              <div className="card-header bg-primary text-white fs-5">
                Resultado de la Comparación
              </div>
              <div className="card-body">
                <ReactMarkdown>{comparison}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
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
          color:rgb(71, 79, 87);
          text-align: center;
        }
      `}</style>
    </>
  );
}