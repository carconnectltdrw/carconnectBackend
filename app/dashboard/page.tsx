"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchProjects, createProject, deleteProject } from "../../components/store/projectsSlice"
import { fetchApps, createApp, deleteApp } from "../../components/store/appsSlice"
import type { RootState } from "../../components/store/store"

export default function Dashboard(){

  const router = useRouter()
  const dispatch = useDispatch()

  const [tab,setTab] = useState<"projects"|"apps">("projects")

  const projects = useSelector((state: RootState) => state.projects.list)
  const apps = useSelector((state: RootState) => state.apps.list)
  const loading = useSelector((state: RootState) => state.projects.loading || state.apps.loading)

  const [projectForm,setProjectForm] = useState({
    title:"",
    type:"",
    mediaUrl:"",
    videoUrl:""
  })

  // -------- APP FORM ----------
  const [appForm,setAppForm] = useState({
    name:"",
    thumbnail:"",
    playstore:"",
    appstore:""
  })

  useEffect(()=>{ 
    dispatch(fetchProjects())
    dispatch(fetchApps())
  }, [dispatch])

  // ---------- UPLOAD ----------
  async function upload(e:any,type:"media"|"thumbnail"|"video"){
    const fd = new FormData()
    fd.append("file",e.target.files[0])

    const res = await fetch("/api/upload",{method:"POST",body:fd})
    const d = await res.json()

    if(type==="media") setProjectForm({...projectForm,mediaUrl:d.url})
    else if(type==="video") setProjectForm({...projectForm,videoUrl:d.url})
    else setAppForm({...appForm,thumbnail:d.url})
  }

  // ---------- SAVE PROJECT ----------
  async function saveProject(){
    await dispatch(createProject(projectForm))
    setProjectForm({title:"",type:"",mediaUrl:"",videoUrl:""})
  }

  // ---------- SAVE APP ----------
  async function saveApp(){
    await dispatch(createApp(appForm))
    setAppForm({name:"",thumbnail:"",playstore:"",appstore:""})
  }

  // ---------- DELETE ----------
  async function handleDeleteProject(id:number){
    console.log('Deleting project with id:', id)
    try {
      const result = await dispatch(deleteProject(id))
      console.log('Delete result:', result)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  async function handleDeleteApp(id:number){
    console.log('Deleting app with id:', id)
    try {
      const result = await dispatch(deleteApp(id))
      console.log('Delete result:', result)
    } catch (error) {
      console.error('Error deleting app:', error)
    }
  }

  // ---------- LOGOUT ----------
  async function logout(){
    await fetch("/api/logout",{method:"POST"})
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-green-50">

      {/* ============ SIDEBAR ============ */}
      <aside className="w-64 bg-green-700 text-white p-6 space-y-6">

        <h1 className="text-2xl font-bold">
          Admin Panel
        </h1>

        <nav className="space-y-2">

          <button
            className={`block w-full text-left px-3 py-2 rounded ${tab==="projects" && "bg-green-900"}`}
            onClick={()=>setTab("projects")}
          >
            📁 Projects
          </button>

          <button
            className={`block w-full text-left px-3 py-2 rounded ${tab==="apps" && "bg-green-900"}`}
            onClick={()=>setTab("apps")}
          >
            📱 Apps
          </button>

        </nav>

        <button
          onClick={logout}
          className="mt-10 bg-red-500 w-full py-2 rounded font-semibold">
          Logout
        </button>

      </aside>

      {/* ============ CONTENT ============ */}
      <main className="flex-1 p-10 space-y-10">

        {/* ================== PROJECTS ================== */}
        {tab==="projects" && (
          <section className="bg-white p-6 rounded-2xl shadow border border-green-200">

            <h2 className="font-bold text-xl text-green-700 mb-4">
              Add Project
            </h2>

            <div className="grid gap-3">

              <input className="border p-2 rounded"
                placeholder="Title"
                value={projectForm.title}
                onChange={e=>setProjectForm({...projectForm,title:e.target.value})}
              />

              <input className="border p-2 rounded"
                placeholder="Type"
                value={projectForm.type}
                onChange={e=>setProjectForm({...projectForm,type:e.target.value})}
              />

              <label className="cursor-pointer">
                📥 Upload Media
                <input type="file" className="hidden"
                  onChange={e=>upload(e,"media")}
                />
              </label>

              {projectForm.mediaUrl && (
                <img src={projectForm.mediaUrl} className="w-32 rounded" />
              )}

              <label className="cursor-pointer">
                📥 Upload Video
                <input type="file" className="hidden"
                  onChange={e=>upload(e,"video")}
                />
              </label>

              {projectForm.videoUrl && (
                <video src={projectForm.videoUrl} className="w-32 rounded" controls />
              )}

              <button
                onClick={saveProject}
                className="bg-green-600 text-white py-2 rounded-lg">

                {loading ? "🌀 Saving..." : "Save Project"}
              </button>
            </div>

            <h3 className="mt-6 font-bold">Existing Projects</h3>

            <div className="grid gap-3 mt-3">
              {projects.map(p=>(
                <div key={p.id}
                  className="border rounded p-3 flex justify-between">

                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-500">{p.status}</div>
                    {p.poster && <img src={p.poster} className="w-16 h-16 object-cover rounded mt-2" />}
                  </div>

                  <button
                    onClick={()=>handleDeleteProject(p.id)}
                    className="text-red-500 font-semibold">
                    Delete
                  </button>
                </div>
              ))}
            </div>

          </section>
        )}

        {/* ================== APPS ================== */}
        {tab==="apps" && (
          <section className="bg-white p-6 rounded-2xl shadow border border-green-200">

            <h2 className="font-bold text-xl text-green-700 mb-4">
              Add App
            </h2>

            <div className="grid gap-3">

              <input className="border p-2 rounded"
                placeholder="App Name"
                value={appForm.name}
                onChange={e=>setAppForm({...appForm,name:e.target.value})}
              />

              <input className="border p-2 rounded"
                placeholder="Play Store URL"
                value={appForm.playstore}
                onChange={e=>setAppForm({...appForm,playstore:e.target.value})}
              />

              <input className="border p-2 rounded"
                placeholder="App Store URL"
                value={appForm.appstore}
                onChange={e=>setAppForm({...appForm,appstore:e.target.value})}
              />

              <label className="cursor-pointer">
                📥 Upload Thumbnail
                <input type="file" className="hidden"
                  onChange={e=>upload(e,"thumbnail")}
                />
              </label>

              {appForm.thumbnail && (
                <img src={appForm.thumbnail} className="w-24 rounded" />
              )}

              <button
                onClick={saveApp}
                className="bg-green-600 text-white py-2 rounded-lg">

                {loading ? "🌀 Saving..." : "Save App"}
              </button>
            </div>

            <h3 className="mt-6 font-bold">Existing Apps</h3>

            <div className="grid gap-3 mt-3">
              {apps.map(a=>(
                <div key={a.id}
                  className="border rounded p-3 flex justify-between">

                  <div>
                    <div className="font-semibold">{a.name}</div>
                    {a.thumbnail && <img src={a.thumbnail} className="w-16 h-16 object-cover rounded mt-2" />}
                  </div>

                  <button
                    onClick={()=>handleDeleteApp(a.id)}
                    className="text-red-500 font-semibold">
                    Delete
                  </button>
                </div>
              ))}
            </div>

          </section>
        )}

      </main>
    </div>
  )
}
