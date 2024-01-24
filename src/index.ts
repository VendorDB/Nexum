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

import 'module-alias/register'
import express from 'express'
import { router } from 'express-file-routing'
import cookieParser from 'cookie-parser'
import config from 'config'
import path from 'path'
import AuthMiddleware from '@middleware/auth'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { Request, Response } from 'express'
import PermMiddleware from '@middleware/perms'

const app = express()

app.set('trust proxy', '127.0.0.1')

async function init() {

	// 10/hour
	app.use('/api/v*/user/resend-verification', rateLimit({
		windowMs: 60 * 60 * 1000,
		max: 10, 
		standardHeaders: true,
		legacyHeaders: false,
		message: async (req: Request, res: Response) => {
			res.setHeader('content-type', 'application/json')
			return {
				status: 'ERROR',
				error: 'TOO_MANY_REQUESTS',
				message: 'You\'re doing this too often'
			}
		}
	}))

	// 10/hour
	app.use('/api/v*/vendor/*/ownership/init', rateLimit({
		windowMs: 60 * 60 * 1000,
		max: 10, 
		standardHeaders: true,
		legacyHeaders: false,
		message: async (req: Request, res: Response) => {
			res.setHeader('content-type', 'application/json')
			return {
				status: 'ERROR',
				error: 'TOO_MANY_REQUESTS',
				message: 'You\'re doing this too often'
			}
		}
	}))

	// 1/hour
	app.use('/api/v*/vendor/request', rateLimit({
		windowMs: 60 * 60 * 1000,
		max: 1, 
		standardHeaders: true,
		legacyHeaders: false,
		message: async (req: Request, res: Response) => {
			res.setHeader('content-type', 'application/json')
			return {
				status: 'ERROR',
				error: 'TOO_MANY_REQUESTS',
				message: 'You\'re doing this too often'
			}
		}
	}))

	app.use(cors())
	app.use(express.json({limit: '10mb'}))
	app.use(cookieParser())
	app.use('/', AuthMiddleware)
	app.use('/api/v*/admin/*', PermMiddleware.admin)
	app.use('/api/v*/moderator/*', PermMiddleware.moderator)
	app.use(config.get('path-prefix'), await router({
		directory: path.join(__dirname, 'routes')
	}))


	app.listen(config.get('port'), () => {
		console.log('Listening on port ' + config.get('port'))
	})
}

init()





