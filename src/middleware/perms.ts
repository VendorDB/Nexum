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

import { Request, Response, NextFunction } from 'express'

const admin = async (req: Request, res: Response, next: NextFunction) => {

	if(!req.user || !req.user.admin){
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'You need to be an administrator to access this'
		})
		return
	}

	next()

}

const moderator = async (req: Request, res: Response, next: NextFunction) => {

	if(!req.user || (!req.user.moderator && !req.user.admin)){
		res.status(401).json({
			status: 'ERROR',
			error: 'UNAUTHORIZED',
			message: 'You need to be a moderator or admin to access this'
		})
		return
	}

	next()

}

export default {
	admin,
	moderator
}