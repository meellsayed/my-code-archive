import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { AnalyticsView } from './components/AnalyticsView'
import { BlockEditorModal } from './components/BlockEditorModal'
import { CurrentBlockTimer } from './components/CurrentBlockTimer'
import { DayBlockList } from './components/DayBlockList'
import { DaySummary } from './components/DaySummary'
import { DayTimeline } from './components/DayTimeline'
import { GoalsPanel } from './components/GoalsPanel'
import { ManageProjects } from './components/ManageProjects'
import { ManageTags } from './components/ManageTags'
import { TagAnalyticsView } from './components/TagAnalyticsView'
import { WeekView } from './components/WeekView'
import { shiftDateKey } from './lib/date'
import { generateAnalyticsReport, getRangeDatesFromFilters } from './lib/analytics'
import { calculateGoalProgress, createEmptyGoalTarget, getPeriodRange } from './lib/goals'
import { exportSnapshotPayload } from './lib/importExport'
import { calculateDayMetrics } from './lib/metrics'
import { findOverlapIds } from './lib/overlap'
import { generateTagAnalyticsReport } from './lib/tagAnalytics'
import { useNotificationScheduler } from './hooks/useNotificationScheduler'
import { usePlannerStore } from './store/plannerStore'
import type {
  GoalPeriod,
  GoalTarget,
  MetricBundle,
  Project,
  Tag,
  TimeBlock,
  ViewMode,
} from './types/planner'

type EditorState = {
  open: boolean
  mode: 'create' | 'edit'
  startMin: number
  endMin: number
  blockId: string | null
}

const PERIODS: GoalPeriod[] = ['daily', 'weekly', 'monthly', 'yearly']

const INITIAL_EDITOR: EditorState = {
  open: false,
  mode: 'create',
  startMin: 9 * 60,
  endMin: 9 * 60 + 30,
  blockId: null,
}

const toMetricBundle = (row?: {
  plannedMinutes: number
  completedMinutes: number
  plannedBlocks: number
  completedBlocks: number
}): MetricBundle => ({
  plannedMinutes: row?.plannedMinutes ?? 0,
  completedMinutes: row?.completedMinutes ?? 0,
  plannedBlocks: row?.plannedBlocks ?? 0,
  completedBlocks: row?.completedBlocks ?? 0,
})

function App() {
  const selectedDate = usePlannerStore((state) => state.selectedDate)
  const days = usePlannerStore((state) => state.days)
  const settings = usePlannerStore((state) => state.settings)
  const projects = usePlannerStore((state) => state.projects)
  const tags = usePlannerStore((state) => state.tags)
  const goals = usePlannerStore((state) => state.goals)
  const activeTab = usePlannerStore((state) => state.activeTab)
  const analyticsFilters = usePlannerStore((state) => state.analyticsFilters)
  const tagAnalyticsFilters = usePlannerStore((state) => state.tagAnalyticsFilters)
  const storageNotice = usePlannerStore((state) => state.storageNotice)

  const setSelectedDate = usePlannerStore((state) => state.setSelectedDate)
  const setActiveTab = usePlannerStore((state) => state.setActiveTab)
  const setAnalyticsRange = usePlannerStore((state) => state.setAnalyticsRange)
  const setCustomAnalyticsRange = usePlannerStore((state) => state.setCustomAnalyticsRange)
  const setTagAnalyticsRange = usePlannerStore((state) => state.setTagAnalyticsRange)
  const setTagCustomAnalyticsRange = usePlannerStore((state) => state.setTagCustomAnalyticsRange)
  const setTagCoOccurrenceLimit = usePlannerStore((state) => state.setTagCoOccurrenceLimit)
  const clearStorageNotice = usePlannerStore((state) => state.clearStorageNotice)
  const setStorageNotice = usePlannerStore((state) => state.setStorageNotice)
  const setNotificationsEnabled = usePlannerStore((state) => state.setNotificationsEnabled)
  const addProject = usePlannerStore((state) => state.addProject)
  const updateProject = usePlannerStore((state) => state.updateProject)
  const archiveProject = usePlannerStore((state) => state.archiveProject)
  const deleteProject = usePlannerStore((state) => state.deleteProject)
  const addTag = usePlannerStore((state) => state.addTag)
  const updateTag = usePlannerStore((state) => state.updateTag)
  const deleteTag = usePlannerStore((state) => state.deleteTag)
  const setGlobalGoal = usePlannerStore((state) => state.setGlobalGoal)
  const setProjectGoal = usePlannerStore((state) => state.setProjectGoal)
  const setTagGlobalGoal = usePlannerStore((state) => state.setTagGlobalGoal)
  const setTagGoal = usePlannerStore((state) => state.setTagGoal)
  const addBlock = usePlannerStore((state) => state.addBlock)
  const updateBlock = usePlannerStore((state) => state.updateBlock)
  const deleteBlock = usePlannerStore((state) => state.deleteBlock)
  const toggleComplete = usePlannerStore((state) => state.toggleComplete)
  const moveResizeBlock = usePlannerStore((state) => state.moveResizeBlock)
  const exportSnapshot = usePlannerStore((state) => state.exportSnapshot)
  const importSnapshot = usePlannerStore((state) => state.importSnapshot)

  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [editorState, setEditorState] = useState<EditorState>(INITIAL_EDITOR)
  const [notificationNotice, setNotificationNotice] = useState<string | null>(null)
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge')

  const blocks = useMemo(
    () => [...(days[selectedDate] ?? [])].sort((a, b) => a.startMin - b.startMin),
    [days, selectedDate],
  )
  const overlapIds = useMemo(() => findOverlapIds(blocks), [blocks])
  const metrics = useMemo(() => calculateDayMetrics(blocks), [blocks])

  const projectsById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project])),
    [projects],
  ) as Record<string, Project>
  const tagsById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag.id, tag])),
    [tags],
  ) as Record<string, Tag>

  const editingBlock = useMemo(
    () => blocks.find((block) => block.id === editorState.blockId) ?? null,
    [blocks, editorState.blockId],
  )

  useNotificationScheduler({ days, enabled: settings.notificationsEnabled })

  const openCreateEditor = (startMin: number, endMin: number) => {
    setEditorState({
      open: true,
      mode: 'create',
      startMin,
      endMin,
      blockId: null,
    })
  }

  const openEditEditor = (block: TimeBlock) => {
    setEditorState({
      open: true,
      mode: 'edit',
      startMin: block.startMin,
      endMin: block.endMin,
      blockId: block.id,
    })
  }

  const closeEditor = () => setEditorState(INITIAL_EDITOR)

  const handleEditorSubmit = (payload: {
    title: string
    startMin: number
    endMin: number
    color: string
    projectIds: string[]
    tagIds: string[]
  }) => {
    if (editorState.mode === 'edit' && editingBlock) {
      updateBlock(editingBlock.id, payload)
      return
    }
    addBlock({ date: selectedDate, ...payload })
  }

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!enabled) {
      setNotificationsEnabled(false)
      setNotificationNotice(null)
      return
    }

    if (typeof Notification === 'undefined') {
      setNotificationNotice('المتصفح الحالي لا يدعم الإشعارات.')
      setNotificationsEnabled(false)
      return
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setNotificationNotice('تم رفض صلاحية الإشعارات.')
        setNotificationsEnabled(false)
        return
      }
    }

    if (Notification.permission !== 'granted') {
      setNotificationNotice('الإشعارات معطلة لهذا الموقع.')
      setNotificationsEnabled(false)
      return
    }

    setNotificationNotice('تم تفعيل الإشعارات بنجاح.')
    setNotificationsEnabled(true)
  }

  const handleExport = () => {
    const snapshot = exportSnapshot()
    const payload = exportSnapshotPayload(snapshot)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `نسخة-احتياطية-${dayjs().format('YYYYMMDD-HHmmss')}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setStorageNotice('تم تصدير النسخة الاحتياطية بنجاح.')
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      importSnapshot(parsed, importMode)
    } catch {
      setStorageNotice('فشل استيراد الملف. تأكد أن الملف بصيغة JSON صحيحة.')
    } finally {
      event.target.value = ''
    }
  }

  const rangeDates = useMemo(
    () => getRangeDatesFromFilters(analyticsFilters, selectedDate),
    [analyticsFilters, selectedDate],
  )

  const analyticsReport = useMemo(
    () =>
      generateAnalyticsReport({
        days,
        projects,
        tags,
        startDate: rangeDates.startDate,
        endDate: rangeDates.endDate,
      }),
    [days, projects, rangeDates.endDate, rangeDates.startDate, tags],
  )

  const tagAnalyticsReport = useMemo(
    () =>
      generateTagAnalyticsReport({
        days,
        tags,
        filters: tagAnalyticsFilters,
        selectedDate,
      }),
    [days, selectedDate, tagAnalyticsFilters, tags],
  )

  const periodReports = useMemo(
    () =>
      Object.fromEntries(
        PERIODS.map((period) => {
          const range = getPeriodRange(selectedDate, period)
          return [
            period,
            generateAnalyticsReport({
              days,
              projects,
              tags,
              startDate: range.startDate,
              endDate: range.endDate,
            }),
          ]
        }),
      ),
    [days, projects, selectedDate, tags],
  ) as Record<GoalPeriod, ReturnType<typeof generateAnalyticsReport>>

  const tagPeriodReports = useMemo(
    () =>
      Object.fromEntries(
        PERIODS.map((period) => {
          const range = getPeriodRange(selectedDate, period)
          return [
            period,
            generateTagAnalyticsReport({
              days,
              tags,
              filters: {
                ...tagAnalyticsFilters,
                range: 'custom',
                customStart: range.startDate,
                customEnd: range.endDate,
              },
              selectedDate,
            }),
          ]
        }),
      ),
    [days, selectedDate, tagAnalyticsFilters, tags],
  ) as Record<GoalPeriod, ReturnType<typeof generateTagAnalyticsReport>>

  const globalGoalRows = useMemo(
    () =>
      PERIODS.map((period) => ({
        period,
        target: goals.global[period],
        progress: calculateGoalProgress(periodReports[period].totals, goals.global[period]),
      })),
    [goals.global, periodReports],
  )

  const projectGoalRows = useMemo(
    () =>
      projects.flatMap((project) =>
        PERIODS.map((period) => {
          const target: GoalTarget = goals.projects[project.id]?.[period] ?? createEmptyGoalTarget()
          const projectBreakdown = periodReports[period].projectBreakdown.find((item) => item.id === project.id)
          return {
            projectId: project.id,
            period,
            target,
            progress: calculateGoalProgress(toMetricBundle(projectBreakdown), target),
          }
        }),
      ),
    [goals.projects, periodReports, projects],
  )

  const tagGlobalGoalRows = useMemo(
    () =>
      PERIODS.map((period) => ({
        period,
        target: goals.tagsGlobal[period],
        progress: calculateGoalProgress(tagPeriodReports[period].totals, goals.tagsGlobal[period]),
      })),
    [goals.tagsGlobal, tagPeriodReports],
  )

  const tagGoalRows = useMemo(
    () =>
      tags.flatMap((tag) =>
        PERIODS.map((period) => {
          const target: GoalTarget = goals.tags[tag.id]?.[period] ?? createEmptyGoalTarget()
          const tagBreakdown = tagPeriodReports[period].tagRows.find((item) => item.id === tag.id)
          return {
            tagId: tag.id,
            period,
            target,
            progress: calculateGoalProgress(toMetricBundle(tagBreakdown), target),
          }
        }),
      ),
    [goals.tags, tagPeriodReports, tags],
  )

  const overlapCount = overlapIds.size
  const dateLabel = dayjs(selectedDate).format('dddd D MMMM YYYY')

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">منظم الوقت</p>
          <h1>لوحة إدارة الوقت بالبلوكات</h1>
          <p className="hero-copy">نظّم يومك، تتبع المشاريع والعلامات، وراقب أهدافك وتحليلاتك بدقة.</p>
        </div>
        <div className="hero-controls">
          <button type="button" onClick={() => setSelectedDate(shiftDateKey(selectedDate, -1))}>
            اليوم السابق
          </button>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          <button type="button" onClick={() => setSelectedDate(shiftDateKey(selectedDate, 1))}>
            اليوم التالي
          </button>
          <button
            type="button"
            className={settings.notificationsEnabled ? 'active' : ''}
            onClick={() => void handleNotificationToggle(!settings.notificationsEnabled)}
          >
            {settings.notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
          </button>
        </div>
      </header>

      <section className="tab-strip">
        <button type="button" className={activeTab === 'planner' ? 'active' : ''} onClick={() => setActiveTab('planner')}>
          التخطيط
        </button>
        <button type="button" className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
          التحليل العام
        </button>
        <button
          type="button"
          className={activeTab === 'tag_analytics' ? 'active' : ''}
          onClick={() => setActiveTab('tag_analytics')}
        >
          تحليل العلامات
        </button>
        <button type="button" className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>
          الإدارة
        </button>
      </section>

      <section className="date-strip">
        <strong>{dateLabel}</strong>
        {overlapCount > 0 && <span className="overlap-chip">{overlapCount} بلوك متداخل</span>}
      </section>

      {storageNotice && (
        <section className="notice warning">
          <p>{storageNotice}</p>
          <button type="button" onClick={clearStorageNotice}>
            إخفاء
          </button>
        </section>
      )}

      {notificationNotice && (
        <section className="notice info">
          <p>{notificationNotice}</p>
        </section>
      )}

      {activeTab === 'planner' && (
        <>
          <section className="tab-strip small">
            <button type="button" className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>
              عرض يومي
            </button>
            <button type="button" className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>
              عرض أسبوعي
            </button>
          </section>

          <DaySummary metrics={metrics} />

          <section className="content-grid">
            <section className="main-panel">
              {viewMode === 'day' ? (
                <DayTimeline
                  blocks={blocks}
                  granularity={settings.granularityMin}
                  overlapIds={overlapIds}
                  projectsById={projectsById}
                  tagsById={tagsById}
                  onCreate={openCreateEditor}
                  onMoveResize={moveResizeBlock}
                  onToggleComplete={toggleComplete}
                  onDelete={deleteBlock}
                  onEdit={openEditEditor}
                />
              ) : (
                <WeekView
                  selectedDate={selectedDate}
                  days={days}
                  onPickDate={(date) => {
                    setSelectedDate(date)
                    setViewMode('day')
                  }}
                />
              )}
            </section>

            <aside className="side-panel">
              <CurrentBlockTimer selectedDate={selectedDate} blocks={blocks} />
              <DayBlockList
                blocks={blocks}
                overlapIds={overlapIds}
                projectsById={projectsById}
                tagsById={tagsById}
                onToggleComplete={toggleComplete}
                onDelete={deleteBlock}
              />
            </aside>
          </section>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          <section className="tab-strip small">
            <button type="button" className={analyticsFilters.range === '7d' ? 'active' : ''} onClick={() => setAnalyticsRange('7d')}>
              آخر 7 أيام
            </button>
            <button type="button" className={analyticsFilters.range === '30d' ? 'active' : ''} onClick={() => setAnalyticsRange('30d')}>
              آخر 30 يوم
            </button>
            <button
              type="button"
              className={analyticsFilters.range === 'custom' ? 'active' : ''}
              onClick={() => setCustomAnalyticsRange(analyticsFilters.customStart, analyticsFilters.customEnd)}
            >
              نطاق مخصص
            </button>
            <input
              type="date"
              value={analyticsFilters.customStart}
              onChange={(event) => setCustomAnalyticsRange(event.target.value, analyticsFilters.customEnd)}
            />
            <input
              type="date"
              value={analyticsFilters.customEnd}
              onChange={(event) => setCustomAnalyticsRange(analyticsFilters.customStart, event.target.value)}
            />
          </section>

          <AnalyticsView
            report={analyticsReport}
            projectsById={projectsById}
            tagsById={tagsById}
            globalGoalRows={globalGoalRows}
            projectGoalRows={projectGoalRows}
          />
        </>
      )}

      {activeTab === 'tag_analytics' && (
        <>
          <section className="tab-strip small">
            <button type="button" className={tagAnalyticsFilters.range === '7d' ? 'active' : ''} onClick={() => setTagAnalyticsRange('7d')}>
              آخر 7 أيام
            </button>
            <button type="button" className={tagAnalyticsFilters.range === '30d' ? 'active' : ''} onClick={() => setTagAnalyticsRange('30d')}>
              آخر 30 يوم
            </button>
            <button
              type="button"
              className={tagAnalyticsFilters.range === 'custom' ? 'active' : ''}
              onClick={() => setTagCustomAnalyticsRange(tagAnalyticsFilters.customStart, tagAnalyticsFilters.customEnd)}
            >
              نطاق مخصص
            </button>
            <button
              type="button"
              className={tagAnalyticsFilters.range === 'custom' && tagAnalyticsFilters.customStart.endsWith('-01-01') ? 'active' : ''}
              onClick={() => {
                const start = dayjs(selectedDate).startOf('year').format('YYYY-MM-DD')
                const end = dayjs(selectedDate).endOf('year').format('YYYY-MM-DD')
                setTagCustomAnalyticsRange(start, end)
              }}
            >
              سنوي
            </button>
            <input
              type="date"
              value={tagAnalyticsFilters.customStart}
              onChange={(event) => setTagCustomAnalyticsRange(event.target.value, tagAnalyticsFilters.customEnd)}
            />
            <input
              type="date"
              value={tagAnalyticsFilters.customEnd}
              onChange={(event) => setTagCustomAnalyticsRange(tagAnalyticsFilters.customStart, event.target.value)}
            />
            <select
              value={tagAnalyticsFilters.coOccurrenceLimit}
              onChange={(event) => setTagCoOccurrenceLimit(Number(event.target.value) as 10 | 20 | 50)}
            >
              <option value={10}>أفضل 10 أزواج</option>
              <option value={20}>أفضل 20 زوج</option>
              <option value={50}>أفضل 50 زوج</option>
            </select>
          </section>

          <TagAnalyticsView
            report={tagAnalyticsReport}
            tagsById={tagsById}
            globalGoalRows={tagGlobalGoalRows}
            tagGoalRows={tagGoalRows}
          />
        </>
      )}

      {activeTab === 'manage' && (
        <section className="manage-layout">
          <ManageProjects
            projects={projects}
            onAdd={addProject}
            onUpdate={updateProject}
            onArchive={archiveProject}
            onDelete={deleteProject}
          />
          <ManageTags tags={tags} onAdd={addTag} onUpdate={updateTag} onDelete={deleteTag} />
          <GoalsPanel
            goals={goals}
            projects={projects}
            tags={tags}
            onSetGlobalGoal={setGlobalGoal}
            onSetProjectGoal={setProjectGoal}
            onSetTagGlobalGoal={setTagGlobalGoal}
            onSetTagGoal={setTagGoal}
          />
          <section className="panel">
            <h3>النسخ الاحتياطي</h3>
            <div className="backup-row">
              <button type="button" onClick={handleExport}>
                تصدير JSON
              </button>
              <select value={importMode} onChange={(event) => setImportMode(event.target.value as 'replace' | 'merge')}>
                <option value="merge">الاستيراد: دمج</option>
                <option value="replace">الاستيراد: استبدال</option>
              </select>
              <input type="file" accept="application/json" onChange={handleImportFile} />
            </div>
            <p className="empty-copy">
              الاستبدال يلغي البيانات الحالية بالكامل. الدمج يحدّث الموجود ويضيف الجديد حسب المعرّفات.
            </p>
          </section>
        </section>
      )}

      {editorState.open && (
        <BlockEditorModal
          key={`${editorState.mode}-${editorState.blockId ?? 'new'}-${editorState.startMin}-${editorState.endMin}`}
          mode={editorState.mode}
          granularity={settings.granularityMin}
          initialRange={{ startMin: editorState.startMin, endMin: editorState.endMin }}
          existingBlock={editingBlock}
          projects={projects}
          tags={tags}
          onClose={closeEditor}
          onSubmit={handleEditorSubmit}
        />
      )}
    </main>
  )
}

export default App

