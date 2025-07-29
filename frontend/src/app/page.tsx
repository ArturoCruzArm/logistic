'use client'

import { useState, useEffect } from 'react'

interface ApiStatus {
  message: string
  version: string
  status: string
  timestamp: string
  environment?: string
}

interface HealthCheck {
  status: string
  uptime: number
  timestamp: string
}

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAPI = async () => {
      try {
        // Check main API
        const apiResponse = await fetch('/api')
        if (apiResponse.ok) {
          const apiData = await apiResponse.json()
          setApiStatus(apiData)
        }

        // Check health
        const healthResponse = await fetch('/api/health')
        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
          setHealthCheck(healthData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error connecting to API')
      } finally {
        setLoading(false)
      }
    }

    checkAPI()
  }, [])

  return (
    <div className="px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Plataforma de Eventos Sociales
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          MVP con Estructura de Costos Transparente
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎯 Transparencia Total
            </h3>
            <p className="text-gray-600">
              Desglose completo de costos con justificación de cada concepto
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 Análisis de Rentabilidad
            </h3>
            <p className="text-gray-600">
              Sistema automático de análisis financiero para proveedores
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🤝 Proceso Colaborativo
            </h3>
            <p className="text-gray-600">
              Citas de proceso incluidas en costos con cálculo de traslados
            </p>
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Estado del Sistema
        </h2>
        
        {loading && (
          <div className="card text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando conexión con API...</p>
          </div>
        )}

        {error && (
          <div className="card border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Error de Conexión
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-red-500">
              Asegúrate de que el servidor backend esté ejecutándose en el puerto 3002
            </p>
          </div>
        )}

        {!loading && !error && apiStatus && (
          <div className="space-y-4">
            <div className="card border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ API Conectada
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Estado:</span>
                  <span className="ml-2 text-green-600">{apiStatus.status}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Versión:</span>
                  <span className="ml-2">{apiStatus.version}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Ambiente:</span>
                  <span className="ml-2">{apiStatus.environment || 'development'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Actualizado:</span>
                  <span className="ml-2">{new Date(apiStatus.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {healthCheck && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  📊 Salud del Sistema
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    <span className="ml-2 text-green-600">{healthCheck.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tiempo activo:</span>
                    <span className="ml-2">{Math.round(healthCheck.uptime)} segundos</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Próximos pasos */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🚀 Próximos Pasos en el Desarrollo
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Servidor backend funcionando
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Frontend Next.js configurado
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              Configurar Supabase (base de datos)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Implementar autenticación
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Sistema de costos transparentes
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}