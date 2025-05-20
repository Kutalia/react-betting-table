import { useCallback, useMemo } from 'react';
import { AutoSizer, Column, defaultTableCellRenderer, defaultTableHeaderRenderer, Table, type TableCellDataGetter, type TableCellRenderer } from 'react-virtualized';

import { defaultCellDataGetter } from 'react-virtualized/dist/es/Table';
import { dateTimeFormat, updateOddsInStore } from '../helpers';
import { useMatches } from '../hooks/useMatches';
import { useMockedWsServer } from '../hooks/useMockedWsServer';
import type { Match, OddsChangeEventDetailType } from '../types';

export const MatchesTable = () => {
  const [matches, setMatches] = useMatches()

  const onOddsChange = useCallback(({ changedOdds, id }: OddsChangeEventDetailType) => {
    updateOddsInStore(changedOdds, id).then(() => {
      setMatches((prevMatches) => [
        ...(prevMatches.filter((m) => m.id !== id)),
        { ...prevMatches.find((m) => m.id === id) as Match, ...changedOdds }
      ])
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

  const cellRenderer = useCallback<TableCellRenderer>((props) => {
    switch (props.dataKey) {
      case 'sport': return <img src={new URL(`../assets/${props.rowData.sport}.svg`, import.meta.url).href} className="h-full" />
      default: return defaultTableCellRenderer(props)
    }
  }, [])

  const columnProps = useMemo(() => ({
    headerRenderer: defaultTableHeaderRenderer,
    cellDataGetter,
    cellRenderer,
    className: 'w-24',
  }), [cellDataGetter, cellRenderer])

  return <AutoSizer>
    {({ height, width }) => <Table
      columnWidth={100}
      height={height}
      width={width}
      rowCount={matches.length}
      rowHeight={30}
      headerHeight={35}
      headerClassName="w-24 font-bold"
      rowClassName="flex"
      rowGetter={({ index }) => matches[index]}
      sortBy="id"
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
