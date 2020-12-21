import React, { useState } from 'react'
import ChannelSelector from '../components/ChannelSelector'
import Link from 'next/link'
import { Tally as TallyType } from '../domain/Tally'
import useChannels from '../hooks/useChannels'
import useProgramPreview from '../hooks/useProgramPreview'
import { socket } from '../hooks/useSocket'

type TallyProps = {
	tally: TallyType,
}

function Tally({ tally }: TallyProps) {
	const channels = useChannels()
	const [programs, previews] = useProgramPreview()

	const patchTally = function (tally, channel) {
		socket.emit('tally.patch', tally.name, channel)
	}

	const handleHighlightTally = (e, tally) => {
		socket.emit('tally.highlight', tally.name)
		e.preventDefault()
	}

	const handleRemoveTally = (e, tally) => {
		socket.emit('tally.remove', tally.name)
		e.preventDefault()
	}
	let classPatched = "card "

	if (tally.isActive()) {
		if (!tally.isPatched()) {
			classPatched += "bg-light "
		} else if (programs && tally.isIn(programs)) {
			classPatched += "bg-danger "
		} else if (previews && tally.isIn(previews)) {
			classPatched += "bg-success "
		} else {
			classPatched += "bg-secondary "
		}
	} else {
		classPatched += "bg-dark "
		if (!tally.isPatched()) {
			classPatched += "border-light "
		} else if (programs && tally.isIn(programs)) {
			classPatched += "border-danger "
		} else if (previews && tally.isIn(previews)) {
			classPatched += "border-success "
		} else {
			classPatched += "border-secondary "
		}
	}
	return (
		<div key={tally.name} className={"tally " + classPatched}>
			<div className="card-header"><h6 className="card-title">{tally.name}</h6>
				{tally.isPatched() ? (
					<div className="card-bubble">{tally.channelId}</div>
				) : ""}</div>
			<div className="card-body">
				<form>
					<div className="form-group">
						<ChannelSelector className="form-control" defaultSelect={tally.channelId} channels={channels} onChange={value => patchTally(tally, value)} />
					</div>
				</form>
				{tally.isActive() ? (
					<a href="#" className="card-link" onClick={e => handleHighlightTally(e, tally)}>Highlight</a>
				) : ""}
				{!tally.isConnected() ? (
					<a href="#" className="card-link" onClick={e => handleRemoveTally(e, tally)}>Remove</a>
				) : ""}
				<Link href="/tally/[tallyName]" as={`/tally/${tally.name}`}>
					<a className="card-link">Logs</a>
				</Link>
			</div>
			{tally.isActive() ? (
				<div className={tally.isMissing() ? "card-footer bg-warning" : "card-footer"}>
					<div className="card-footer-left">{tally.isMissing() ? "missing" : "connected"}</div>
					<div className="card-footer-right text-muted">{tally.address}:{tally.port}</div>
				</div>
			) : (
					<div className="card-footer">disconnected</div>
				)}
		</div>
	)
}


export default Tally;
