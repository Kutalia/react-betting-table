import { useCallback, useMemo, useState } from 'react';
import { AutoSizer, Column, defaultTableCellRenderer, defaultTableHeaderRenderer, Table, type ScrollEventData, type ScrollParams, type TableCellDataGetter, type TableCellRenderer } from 'react-virtualized';

import { defaultCellDataGetter } from 'react-virtualized/dist/es/Table';
import { dateTimeFormat, formatToPercent, retrieveScrollPosition, retrieveSelectedOdds, saveScrollPosition, saveSelectedOdd, updateOddsInStore } from '../helpers';
import { useMatches } from '../hooks/useMatches';
import { useMockedWsServer } from '../hooks/useMockedWsServer';
import type { Match, Odds, OddsChangeEventDetailType } from '../types';

export const MatchesTable = () => {
  const [matches, setMatches] = useMatches()

  const [selectedOdds, setSelectedOdds] = useState(retrieveSelectedOdds)

  const onOddsChange = useCallback(({ changedOdds, id }: OddsChangeEventDetailType) => {
    updateOddsInStore(changedOdds, id).then(() => {
      setMatches((prevMatches) => {
        const newMatches = [...prevMatches]
        newMatches.splice(
          prevMatches.findIndex((m) => m.id === id),
          1,
          { ...prevMatches.find((m) => m.id === id) as Match, ...changedOdds }
        )
        return newMatches
      })
    })
  }, [])

  const matchIds = useMemo(() => matches.map(({ id }) => id), [matches.length])

  useMockedWsServer({
    onOddsChange,
    matchIds,
  })

  const cellDataGetter = useCallback<TableCellDataGetter>((params) => {
    switch (params.dataKey) {
      case 'score': return `${params.rowData.scoreHome}-${params.rowData.scoreAway}`
      case 'startDateTime': return dateTimeFormat.format(new Date(params.rowData.startDateTime))
      default: return defaultCellDataGetter(params)
    }
  }, [])

  const handleOddClick = useCallback((id: string, oddType: keyof Odds) => setSelectedOdds(saveSelectedOdd(id, oddType)), [])

  const cellRenderer = useCallback<TableCellRenderer>((props) => {
    switch (props.dataKey) {
      case 'sport': return <img src={new URL(`../assets/${props.rowData.sport}.svg`, import.meta.url).href} className="h-full" />
      case 'odd1':
      case 'oddX':
      case 'odd2':
      case 'odd1X':
      case 'odd2X': {
        const odd = props.cellData
        const changedOdd: number = props.rowData[`${props.dataKey}Changed`]

        if (changedOdd === odd) {
          return defaultTableCellRenderer(props)
        }

        const change = (changedOdd - odd) / odd
        const changePercentStr = formatToPercent(change)

        const selectedOdd = selectedOdds ? selectedOdds[props.rowData.id] : undefined

        return <div className="pr-4">
          <div
            className={`flex items-center gap-4 px-1 cursor-pointer hover:!bg-sky-400 transition-colors duration-200`}
            style={{
              backgroundColor: change > 0 ? '#24b548cf' : '#e67e8ecf',
              border: `${selectedOdd === props.dataKey ? '3px solid black' : 'none'}`
            }}
            onClick={() => handleOddClick(props.rowData.id, props.dataKey as keyof Odds)}
          >
            <p className="w-full" title={String(changedOdd)}>{changedOdd}</p>
            <p className="w-full text-xs" title={changePercentStr}>{changePercentStr}</p>
          </div>
        </div>
      }
      default: return defaultTableCellRenderer(props)
    }
  }, [selectedOdds, handleOddClick])

  const columnProps = useMemo(() => ({
    headerRenderer: defaultTableHeaderRenderer,
    cellDataGetter,
    cellRenderer,
    className: 'w-38',
  }), [cellDataGetter, cellRenderer])

  const [scrollTop, setScrollTop] = useState(retrieveScrollPosition)
  const [isRendered, setIsRendered] = useState(false)

  const handleScroll = useCallback((e: ScrollParams | ScrollEventData) => {
    // Don't save values until rendering is done
    // That is because during this time table will keep firing scroll events with 0 scrollTop value
    if (!isRendered) {
      return
    }

    saveScrollPosition(e.scrollTop)
    setScrollTop(e.scrollTop)
  }, [isRendered])

  return <AutoSizer>
    {({ height, width }) => <Table
      columnWidth={100}
      height={height}
      width={width}
      rowCount={matches.length}
      rowHeight={30}
      headerHeight={35}
      headerClassName="w-38 font-bold"
      rowClassName="flex"
      rowGetter={({ index }) => matches[index]}
      sortBy="id" // I think this one's glitched too
      onScroll={handleScroll}
      scrollTop={scrollTop}
      onRowsRendered={() => setIsRendered(true)}
    >
      {/* There seems to be a bug where `width` prop doesn't change anything but it's still needed */}
      <Column {...columnProps} className="!w-16 p-1" headerClassName="!w-16" width={200} label="Sport" dataKey="sport" />
      <Column {...columnProps} className="!w-48" headerClassName="!w-48" width={200} label="Start Time" dataKey="startDateTime" />
      <Column {...columnProps} headerClassName="!w-64" className="!w-64 truncate" width={100} label="Home Team" dataKey="teamHome" />
      <Column {...columnProps} headerClassName="!w-64" className="!w-64 truncate" width={100} label="Away Team" dataKey="teamAway" />
      <Column {...columnProps} width={50} label="1" dataKey="odd1" />
      <Column {...columnProps} width={50} label="x" dataKey="oddX" />
      <Column {...columnProps} width={50} label="2" dataKey="odd2" />
      <Column {...columnProps} width={50} label="1X" dataKey="odd1X" />
      <Column {...columnProps} width={50} label="2X" dataKey="odd2X" />
      <Column {...columnProps} width={50} label="score" dataKey="score" />
    </Table>}
  </AutoSizer>
}
