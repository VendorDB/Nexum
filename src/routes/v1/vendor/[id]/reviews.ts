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
import { ObjectId } from 'mongodb'

export const get: Handler = async (req, res) => {

	const pageSize = parseInt(<string>req.query.limit) || 25

	const pageNumber = parseInt(<string>req.query.page) || 1

	const skipItems = (pageNumber - 1) * pageSize

	const filter = { _id: new ObjectId(req.params.id) }

	const projection = {
		reviews: { $slice: ['$reviews', skipItems, pageSize] }
	}

	const pipeline = [
		{ $match: filter },
		{ $project: projection }
	]

	const result = <Vendor[]>await mongo.aggregate('Vendors', pipeline)

	if (!result || !result[0] || !result[0].reviews) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'The provided ID is invalid, or reviews have not yet been initialized'
		})
		return
	}

	res.json(result[0].reviews)

}

export const post: Handler = async (req, res) => {
	const user = req.user

	if (!user) {
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'Please log in first'
		})
		return
	}

	const vendor = await mongo.queryOne('Vendors', { _id: req.params.id })

	if (!vendor) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'There is no vendor with the provided ID'
		})
		return
	}

	const stars = req.body.stars
	const message = req.body.message
	const attachments = req.body.attachments

	await mongo.update('Vendors', { _id: req.params.id }, {
		$push: {
			reviews: {
				stars,
				message,
				attachments,
				created: Date.now(),
				author: {
					username: req.user.username,
					id: req.user._id.toString()
				}
			}
		}
	})

	res.json({
		status: 'SUCCESS'
	})

}
