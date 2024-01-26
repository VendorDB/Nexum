// Copyright (C) 2024 Marcus Huber (xenorio) <dev@xenorio.xyz>
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

	const user = <User | null>await mongo.queryOne('Users', { _id: new ObjectId(req.params.id) })

	if (!user) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'There is no user with this ID'
		})
		return
	}

	const pageSize = parseInt(<string>req.query.limit) || 25
	const pageNumber = parseInt(<string>req.query.page) || 1
	const skipItems = (pageNumber - 1) * pageSize

	const pipeline = [
		{ $match: { 'author._id': req.params.id, isHeld: false } },
		{ $sort: { created: -1, _id: 1 } },
		{ $skip: skipItems },
		{ $limit: pageSize }
	]

	const reviews = <Review[]>await mongo.aggregate('Reviews', pipeline)

	res.json(reviews)
}