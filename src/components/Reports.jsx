import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../lib/supabaseClient'

import toast from 'react-hot-toast'

function Reports() {

  const [reports, setReports] =
    useState([])

  async function fetchReports() {

    const { data, error } =
      await supabase
        .from('reports')
        .select(`
          *,
          requests (
            id,
            title,
            description,
            image_url
          )
        `)
        .order('created_at', {
          ascending: false,
        })

    if (error) {
      console.log(error)
      return
    }

    setReports(data)
  }

  useEffect(() => {
    fetchReports()
  }, [])

  async function deleteRequest(
    requestId
  ) {

    const confirmDelete =
      window.confirm(
        'Delete this request?'
      )

    if (!confirmDelete) return

    const { error } =
      await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)

    if (error) {
      console.log(error)
      toast.error(error.message)
      return
    }

    toast.success(
      'Request deleted'
    )

    fetchReports()
  }

  async function ignoreReport(
    reportId
    ) {

    const { error } =
        await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

    if (error) {
        console.log(error)
        toast.error(error.message)
        return
    }

    toast.success(
        'Report ignored'
    )

    // REMOVE FROM UI IMMEDIATELY
    setReports((prev) =>
        prev.filter(
        (report) =>
            report.id !== reportId
        )
    )
    }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Reported Requests
          </h2>

          <p className="text-sm text-gray-500">
            {reports.length} reports
          </p>
        </div>

      </div>

      <div className="space-y-4">

        {reports.length === 0 ? (

          <div className="text-center py-10">

            <div className="text-5xl mb-3">
              🎉
            </div>

            <p className="text-gray-500">
              No reports found
            </p>

          </div>

        ) : (

          reports.map((report) => (

            <div
              key={report.id}
              className="border border-orange-200 bg-orange-50 rounded-2xl p-5"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex-1">

                  <h3 className="text-lg font-bold text-gray-800">
                    {
                      report.requests
                        ?.title
                    }
                  </h3>

                  <p className="text-gray-600 mt-2">
                    {
                      report.requests
                        ?.description
                    }
                  </p>

                  <div className="mt-4">

                    <p className="text-sm font-semibold text-orange-700">
                      Report Reason:
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      {report.reason}
                    </p>

                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    {new Date(
                      report.created_at
                    ).toLocaleString()}
                  </p>

                </div>

                {report.requests
                  ?.image_url && (
                  <img
                    src={
                      report.requests
                        .image_url
                    }
                    alt="Request"
                    className="w-28 h-28 rounded-2xl object-cover"
                  />
                )}

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() =>
                    deleteRequest(
                      report.requests.id
                    )
                  }
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Delete Request
                </button>

                <button
                  onClick={() =>
                    ignoreReport(
                      report.id
                    )
                  }
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm"
                >
                  Ignore
                </button>

              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reports