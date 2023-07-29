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

type SortField = 'created' | 'stars'

export const get: Handler = async (req, res) => {

	const pageSize = parseInt(<string>req.query.limit) || 25
	const pageNumber = parseInt(<string>req.query.page) || 1
	const skipItems = (pageNumber - 1) * pageSize

	const sortField: SortField = req.query.sort as SortField || 'created' // Default sorting by creation date
	const sortOrder = req.query.order === 'desc' ? -1 : 1

	console.log(sortOrder + ' | ' + typeof sortOrder)
	console.log(sortField + ' | ' + typeof sortField)

	const filter = { _id: new ObjectId(req.params.id) }

	const sorting = {
		[sortField]: sortOrder,
	} as { [key in SortField]: number }

	sorting[sortField] = sortOrder

	const pipeline = [
		{ $match: filter },
		{ $unwind: '$reviews' }, // Unwind the reviews array
		{
			$project: {
				_id: 0, // Exclude the _id field from the output
				reviews: 1 // Include only the reviews field in the output
			}
		},
		{
			$replaceRoot: { newRoot: '$reviews' } // Promote the "reviews" field to the root level
		},
		{ $sort: { [sortField]: sortOrder } }, // Sort the reviews directly using field name and order
		{ $skip: skipItems }, // Apply pagination with $skip
		{ $limit: pageSize }, // Apply pagination with $limit
	]

	const result = <Review[]>(await mongo.aggregate('Vendors', pipeline))

	if (!result) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'The provided ID is invalid, or reviews have not yet been initialized'
		})
		return
	}

	res.json(result)

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

	const vendor = <Vendor>await mongo.queryOne('Vendors', { _id: req.params.id })

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

	// Calculate the likelihood to be held for moderator review
	// If reputation < 1: Always true
	// If reputation >= 1: For each reputation, gain 1% chance of instant publishing, up to 75%
	//const isHeld = user.reputation > 0 ? Math.random() <= Math.min(user.reputation / 100, 0.75) : true
	const isHeld = false

	const review: Review = {
		stars,
		message,
		attachments,
		created: Date.now(),
		author: {
			username: req.user.username,
			id: req.user._id.toString()
		}
	}

	if (isHeld) {
		mongo.insert('HeldReviews', {
			vendor: vendor._id,
			review
		})
	} else {

		// Increase reputation on published reviews
		mongo.update('Users', { _id: user._id }, {
			reputation: user.reputation + 1
		})

		await mongo.updatePush('Vendors', { _id: new ObjectId(req.params.id) }, {
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
		})
	}

	res.json({
		status: 'SUCCESS',
		isHeld
	})

}
