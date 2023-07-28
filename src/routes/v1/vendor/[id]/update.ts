// Copyright (C) 2023 Marcus Huber (xenorio) <dev@xenorio.xyz>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Handler } from 'express'
import mongo from '@util/mongo'

export const post: Handler = async (req, res) => {
	if (!req.user) {
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'You must be logged in to do this'
		})
		return
	}

	const vendor = <Vendor>await mongo.queryOne('Vendors', { _id: req.params.id })

	if (!vendor) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'There is no vendor with the provided ID'
		})
		return
	}

	if (!req.user.admin && (!vendor.owner || vendor.owner !== req.user._id)) {
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'You must own this vendor page or be an administrator'
		})
		return
	}

	await mongo.update('Vendors', { _id: req.params.id }, req.body)

	res.json({
		status: 'SUCCESS'
	})

}
