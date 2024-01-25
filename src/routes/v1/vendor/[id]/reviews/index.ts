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
import config from 'config'
import ms from 'ms'

type SortField = 'created' | 'stars'

export const get: Handler = async (req, res) => {
	const pageSize = parseInt(<string>req.query.limit) || 25
	const pageNumber = parseInt(<string>req.query.page) || 1
	const skipItems = (pageNumber - 1) * pageSize

	const sortField: SortField = req.query.sort as SortField || 'created' // Default sorting by creation date
	const sortOrder = req.query.order === 'desc' ? -1 : 1

	const filter: any = { vendor: new ObjectId(req.params.id) }

	if (req.user && (req.user.moderator || req.user.admin) && req.query.held) {
		filter['isHeld'] = true
	} else {
		filter['isHeld'] = false
	}

	const pipeline = [
		{ $match: filter },
		{ $sort: { [sortField]: sortOrder, _id: 1 } }, // Sort the reviews directly using field name and order
		{ $skip: skipItems }, // Apply pagination with $skip
		{ $limit: pageSize }, // Apply pagination with $limit
	]

	const result = <Review[]>(await mongo.aggregate('Reviews', pipeline))

	if (!result || result.length === 0) {
		res.status(404).json({
			status: 'ERROR',
			error: 'NOT_FOUND',
			message: 'No reviews found for the provided vendor ID',
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

	if (user.perms != 2 && user.lastReviewPosted > Date.now() - ms(<string>config.get('review-delay'))) {
		res.status(401).json({
			status: 'ERROR',
			error: 'REVIEW_DELAY',
			message: 'You already posted a review in the last ' + config.get('review-delay')
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

	let stars = Math.floor(req.body.stars)
	const message = req.body.message
	const attachments = req.body.attachments

	if (message.length > 2500) {
		res.status(401).json({
			status: 'ERROR',
			error: 'TOO_LONG',
			message: 'The maximum review length is 2500 characters'
		})
		return
	}

	// Prevent tomfoolery
	if (stars > 5) {
		stars = 5
	} else if (stars < 1) {
		stars = 1
	}

	// Calculate the likelihood to be held for moderator review
	// If reputation < 1: Always true
	// If reputation >= 1: For each reputation, gain 1% chance of instant publishing, up to 75%
	const isHeld = user.reputation > 0 ? Math.random() >= Math.min(user.reputation / 100, 0.75) : true
	//const isHeld = false

	const review: Review = {
		stars,
		message,
		attachments,
		created: Date.now(),
		author: {
			_id: req.user._id.toString(),
			username: req.user.username
		},
		isHeld,
		vendor: vendor._id,
		likes: [],
		likeAmount: 0,
		reported: false
	}

	//console.log(await mongo.query('Reviews', {vendor: vendor._id}))

	mongo.insert('Reviews', review)

	if (!isHeld) {
		mongo.update('Vendors', { _id: vendor._id }, {
			stars: vendor.stars + stars,
			reviewAmount: vendor.reviewAmount + 1,
			averageRating: (vendor.stars + stars) / (vendor.reviewAmount + 1)
		})
	}

	mongo.update('Users', { _id: user._id }, {
		lastReviewPosted: Date.now()
	})

	res.json({
		status: 'SUCCESS',
		isHeld
	})

}
