/*
	IntersectionObserver API наблюдает за пересечением элемента (target)
	с его родителем (root) или областью просмотра (viewport).

	Для работы с трансформациями, наблюдаемому эл-ту нужно добавить wrapper,
	иначе observer может его не увидеть.

	Options:
		- root - родитель целевого элемента - область просмотра
		- rootMargin - отступ области просмотра (>0px - наружу, <0px - внутрь)
		- threshold - процент пересечения эл-та
*/
window.addEventListener('load', () => {
	const options = {
		// root: document.querySelector('.scroll-list'),
		rootMargin: '-50px',
		threshold: 0.01
	}

	const observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('_intersecting');
				observer.unobserve(entry.target);
			}
		})
	}, options)

	document.querySelectorAll('.g-h1').forEach(item => {
		if (item.offsetTop < (pageYOffset + window.innerHeight))
			item.classList.add('_intersecting');
		else observer.observe(item);
	})
})